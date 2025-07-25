// src/app/components/LoginForm.tsx
"use client";
import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import LoginFormPerson from "./LoginFormPerson";
import LoginFormOtp from "./LoginFormOtp";
import SessionService from "../services/sessionService";
import { useUser } from "../contexts/UserContext";
import { useZonesContext } from "../contexts/ZonesContext";
import MyMMOApiZone from "../services/mymmo-service/apiZones";
import MyMMOApiPhone from "../services/mymmo-service/apiPhone";
import { getDeviceId, generateAuthToken } from "../utils/deviceId";
import { User } from "lucide-react";
import { useToast, ToastList } from "./ui/useToast";

//tijdelijk hier , //! verwijderen dit later
const mockPersons = [
  { id: "925", name: "indisch" },
  { id: "778", name: "Mymmo support" },
  { id: "1375", name: "Nestor [ik]" },
  { id: "1010", name: "nico" },
];

// For phone code dropdown
const defaultPhoneCode = "+32";

export default function LoginForm() {
  const [selectedPerson, setSelectedPerson] = useState("");
  const [appLanguage, setAppLanguage] = useState("nl");
  const [translationLanguage, setTranslationLanguage] = useState("nl");
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"person" | "otp">("person");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const router = useRouter();
  const { refreshUser } = useUser();
  const queryClient = useQueryClient();
  const { resetZones } = useZonesContext();

  const { toasts, showToast } = useToast();

  const resetLoginFormState = () => {
    setSelectedPerson("");
    setAppLanguage("nl");
    setTranslationLanguage("nl");
    setPhoneNumber("");
    setOtpCode("");
    setAuthToken("");
    setIsOtpSent(false);
    setIsLoading(false);
    queryClient.clear();
    resetZones();
  };

  const handlePersonLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPerson) {
      showToast("error", "Selecteer een persoon om door te gaan.");
      return;
    }

    setIsLoading(true);
    console.log(
      "LoginForm: Starting login process for person:",
      selectedPerson
    );

    try {
      await SessionService.clearSession();

      const sessionData = await SessionService.createSession(
        selectedPerson,
        appLanguage,
        translationLanguage
      );

      await refreshUser();

      console.log("LoginForm: Prefetching zones data...");
      const personIdNum = Number.parseInt(selectedPerson);

      queryClient.prefetchQuery({
        queryKey: ["zones", selectedPerson, translationLanguage],
        queryFn: () =>
          MyMMOApiZone.getZonesByPerson(
            personIdNum,
            personIdNum,
            translationLanguage
          ),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      });

      const targetUrl = `/zones/${selectedPerson}`;
      const params = new URLSearchParams({
        appLang: sessionData.appLang,
        translationLang: sessionData.translationLang,
      });

      const fullUrl = `${targetUrl}?${params.toString()}`;

      console.log("LoginForm: Navigating to:", fullUrl);
      router.push(fullUrl);
    } catch (error) {
      console.error("Login failed:", error);
      showToast("error", "Inloggen mislukt. Probeer het opnieuw.");
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber) {
      showToast("error", "Voer een telefoonnummer in.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await MyMMOApiPhone.sendOtp({
        mobileNumber: phoneNumber,
      });

      // Generate auth token for this session
      const token = generateAuthToken();
      setAuthToken(token);
      setIsOtpSent(true);

      if (response.data.success) {
        showToast("success", "OTP verstuurd naar uw telefoonnummer.");
      } else {
        showToast(
          "info",
          response.data.message || "OTP verstuurd naar uw telefoonnummer."
        );
      }
    } catch (error) {
      console.error("Send OTP failed:", error);
      showToast(
        "error",
        "Fout bij het versturen van OTP. Probeer het opnieuw."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 4) {
      showToast("error", "Voer een geldige 4-cijferige OTP code in.");
      return;
    }

    setIsLoading(true);

    try {
      const deviceId = getDeviceId();

      const response = await MyMMOApiPhone.verifyOtp({
        mobileNumber: phoneNumber,
        otp: otpCode,
        deviceId,
        authToken,
      });

      // Check if verification was successful based on the message
      const isVerificationSuccessful =
        response.data.message &&
        response.data.message.toLowerCase().includes("successful");

      if (isVerificationSuccessful) {
        // Get personId from response or use fallback
        const personId = response.data.personId || "1375"; //! fallback to default , dit is tijdelijk

        await SessionService.clearSession();

        console.log(
          "OTP verification successful, creating session for person:",
          personId
        );
        await SessionService.createSession(
          personId,
          appLanguage,
          translationLanguage
        );

        // Refresh user context after session creation
        await refreshUser();

        // Prefetch zones data for better user experience
        console.log("OTP login: Prefetching zones data...");
        const personIdNum = Number.parseInt(personId);

        queryClient.prefetchQuery({
          queryKey: ["zones", personId, translationLanguage],
          queryFn: () =>
            MyMMOApiZone.getZonesByPerson(
              personIdNum,
              personIdNum,
              translationLanguage
            ),
          staleTime: 5 * 60 * 1000,
          gcTime: 10 * 60 * 1000,
        });

        showToast("success", "OTP verificatie succesvol!");

        router.push(
          `/zones/${personId}?appLang=${appLanguage}&translationLang=${translationLanguage}`
        );
      } else {
        showToast(
          "error",
          `OTP verificatie mislukt: ${
            response.data.message || "Probeer het opnieuw."
          }`
        );
      }
    } catch (error) {
      console.error("Verify OTP failed:", error);
      showToast(
        "error",
        "Fout bij het verifiëren van OTP. Probeer het opnieuw."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastList toasts={toasts} />
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col items-center border border-[rgba(207,196,199,0.5)]">
        {/* Icon */}
        <div className="bg-[#facf59] rounded-full w-14 h-14 flex items-center justify-center mb-6">
          <User className="text-[#552e38] w-6 h-6" />
        </div>

        {/* Header */}
        <h2 className="text-2xl font-semibold mb-2 text-[#552e38]">
          Aanmelden
        </h2>
        <p className="text-[#a69298] mb-8 text-center text-sm">
          Kies een manier om aan te melden
        </p>

        {/* Method Toggle */}
        <div className="w-full mb-6">
          <div className="flex rounded-lg bg-[#f5f2de] p-1">
            <button
              type="button"
              onClick={() => {
                resetLoginFormState();
                setLoginMethod("person");
              }}
              className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                loginMethod === "person"
                  ? "bg-white text-[#552e38] shadow-sm"
                  : "text-[#765860] hover:text-[#552e38]"
              }`}
            >
              Bestaande persoon
            </button>
            <button
              type="button"
              onClick={() => {
                resetLoginFormState();
                setLoginMethod("otp");
              }}
              className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                loginMethod === "otp"
                  ? "bg-white text-[#552e38] shadow-sm"
                  : "text-[#765860] hover:text-[#552e38]"
              }`}
            >
              OTP Login
            </button>
          </div>
        </div>

        {loginMethod === "person" ? (
          <LoginFormPerson
            mockPersons={mockPersons}
            selectedPerson={selectedPerson}
            setSelectedPerson={setSelectedPerson}
            appLanguage={appLanguage}
            setAppLanguage={setAppLanguage}
            translationLanguage={translationLanguage}
            setTranslationLanguage={setTranslationLanguage}
            isLoading={isLoading}
            handlePersonLogin={handlePersonLogin}
          />
        ) : (
          <LoginFormOtp
            appLanguage={appLanguage}
            setAppLanguage={setAppLanguage}
            translationLanguage={translationLanguage}
            setTranslationLanguage={setTranslationLanguage}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            isOtpSent={isOtpSent}
            isLoading={isLoading}
            handleSendOtp={handleSendOtp}
            handleVerifyOtp={handleVerifyOtp}
            resetLoginFormState={resetLoginFormState}
            defaultPhoneCode={defaultPhoneCode}
          />
        )}
      </div>
    </>
  );
}
