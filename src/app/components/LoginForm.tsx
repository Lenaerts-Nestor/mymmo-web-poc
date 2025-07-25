// src/app/components/LoginForm.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import LanguageSelector from "./ui/LanguageSelector";
import PersonSelector from "./ui/PersonSelector";
import { appLanguages, deepLLanguages } from "../constants/languages";
import SessionService from "../services/sessionService";
import { useUser } from "../contexts/UserContext";
import MyMMOApiZone from "../services/mymmo-service/apiZones";
import MyMMOApiPhone from "../services/mymmo-service/apiPhone";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../components/ui/input-otp";
import { getDeviceId, generateAuthToken } from "../utils/deviceId";

//tijdelijk hier , //! verwijderen dit later
const mockPersons = [
  { id: "925", name: "Persoon 925" }, //random dirk rv ofzo. /random persoon
  { id: "778", name: "Persoon 778" }, //mymmo-service support
  { id: "1375", name: "Persoon 1375" }, //ik nestor / mijn persoon
  { id: "1010", name: "Persoon 1010" }, //echte van  mymmo. dit is een echte persoon
];

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

  const handlePersonLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPerson) {
      alert("Selecteer een persoon om door te gaan.");
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
      const personIdNum = parseInt(selectedPerson);

      queryClient.prefetchQuery({
        queryKey: ["zones", selectedPerson, translationLanguage],
        queryFn: () =>
          MyMMOApiZone.getZonesByPerson(
            personIdNum,
            personIdNum,
            translationLanguage
          ),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
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
      alert("Inloggen mislukt. Probeer het opnieuw.");
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      alert("Voer een telefoonnummer in.");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await MyMMOApiPhone.sendOtp({
        mobileNumber: phoneNumber
      });
      
      // Generate auth token for this session
      const token = generateAuthToken();
      setAuthToken(token);
      setIsOtpSent(true);
      
      if (response.data.success) {
        alert("OTP verstuurd naar uw telefoonnummer.");
      } else {
        alert(response.data.message || "OTP verstuurd naar uw telefoonnummer.");
      }
    } catch (error) {
      console.error("Send OTP failed:", error);
      alert("Fout bij het versturen van OTP. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.length !== 4) {
      alert("Voer een geldige 4-cijferige OTP code in.");
      return;
    }

    setIsLoading(true);
    
    try {
      const deviceId = getDeviceId();
      
      const response = await MyMMOApiPhone.verifyOtp({
        mobileNumber: phoneNumber,
        otp: otpCode,
        deviceId,
        authToken
      });
      
      // Check if verification was successful based on the message
      const isVerificationSuccessful = response.data.message && 
        response.data.message.toLowerCase().includes("successful");
      
      if (isVerificationSuccessful) {
        // Get personId from response or use fallback
        const personId = response.data.personId || "1375"; // fallback to default
        
        // Clear any existing session first
        await SessionService.clearSession();
        
        // Create session after successful OTP verification
        console.log("OTP verification successful, creating session for person:", personId);
        await SessionService.createSession(personId, appLanguage, translationLanguage);
        
        // Refresh user context after session creation
        await refreshUser();
        
        // Prefetch zones data for better user experience
        console.log("OTP login: Prefetching zones data...");
        const personIdNum = parseInt(personId);
        
        queryClient.prefetchQuery({
          queryKey: ["zones", personId, translationLanguage],
          queryFn: () =>
            MyMMOApiZone.getZonesByPerson(
              personIdNum,
              personIdNum,
              translationLanguage
            ),
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
        });
        
        alert("OTP verificatie succesvol!");
        
        // Navigate to zones with proper URL structure
        router.push(`/zones/${personId}?appLang=${appLanguage}&translationLang=${translationLanguage}`);
      } else {
        alert(`OTP verificatie mislukt: ${response.data.message || "Probeer het opnieuw."}`);
      }
    } catch (error) {
      console.error("Verify OTP failed:", error);
      alert("Fout bij het verifiëren van OTP. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
      <div className="bg-blue-600 rounded-full w-14 h-14 flex items-center justify-center mb-4">
        <span role="img" aria-label="user" className="text-white text-2xl">
          😂
        </span>
      </div>

      <h2 className="text-2xl font-bold mb-2">Aanmelden</h2>
      <p className="text-gray-500 mb-6 text-center text-sm">
        Kies een manier om aan te melden
      </p>

      <div className="w-full mb-4">
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setLoginMethod("person")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              loginMethod === "person"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Bestaande persoon
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod("otp")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              loginMethod === "otp"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            OTP Login
          </button>
        </div>
      </div>

      {loginMethod === "person" ? (
        <form className="w-full" onSubmit={handlePersonLogin}>
        <PersonSelector
          label="Bestaande persoon"
          persons={mockPersons}
          value={selectedPerson}
          onChange={setSelectedPerson}
        />

        <LanguageSelector
          label="Taal"
          languages={appLanguages}
          value={appLanguage}
          onChange={setAppLanguage}
        />

        <LanguageSelector
          label="Vertalingstaal"
          languages={deepLLanguages}
          value={translationLanguage}
          onChange={setTranslationLanguage}
        />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-semibold py-2 rounded transition-colors ${
              isLoading
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Inloggen..." : "Inloggen als geselecteerde persoon"}
          </button>
        </form>
      ) : (
        <div className="w-full">
          <LanguageSelector
            label="Taal"
            languages={appLanguages}
            value={appLanguage}
            onChange={setAppLanguage}
          />

          <LanguageSelector
            label="Vertalingstaal"
            languages={deepLLanguages}
            value={translationLanguage}
            onChange={setTranslationLanguage}
          />

          {!isOtpSent ? (
            <form onSubmit={handleSendOtp}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefoonnummer
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+31 6 12345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-semibold py-2 rounded transition-colors ${
                  isLoading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isLoading ? "Versturen..." : "OTP Versturen"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voer de 4-cijferige OTP code in
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={4}
                    value={otpCode}
                    onChange={setOtpCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtpCode("");
                    setAuthToken("");
                  }}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Terug
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 4}
                  className={`flex-1 font-semibold py-2 rounded transition-colors ${
                    isLoading || otpCode.length !== 4
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? "Verifiëren..." : "Verifiëren"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
