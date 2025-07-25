import React from "react";
import LanguageSelector from "./ui/LanguageSelector";
import PhoneCodeInput from "./ui/PhoneCodeInput";
import { appLanguages, deepLLanguages } from "../constants/languages";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../../components/ui/input-otp";

interface LoginFormOtpProps {
  appLanguage: string;
  setAppLanguage: (lang: string) => void;
  translationLanguage: string;
  setTranslationLanguage: (lang: string) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  otpCode: string;
  setOtpCode: (val: string) => void;
  isOtpSent: boolean;
  isLoading: boolean;
  handleSendOtp: (e: React.FormEvent) => void;
  handleVerifyOtp: (e: React.FormEvent) => void;
  resetLoginFormState: () => void;
  defaultPhoneCode: string;
}

export default function LoginFormOtp({
  appLanguage,
  setAppLanguage,
  translationLanguage,
  setTranslationLanguage,
  phoneNumber,
  setPhoneNumber,
  otpCode,
  setOtpCode,
  isOtpSent,
  isLoading,
  handleSendOtp,
  handleVerifyOtp,
  resetLoginFormState,
  defaultPhoneCode,
}: LoginFormOtpProps) {
  return (
    <div className="w-full">
      <div className="space-y-5 mb-6">
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
      </div>
      {!isOtpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <PhoneCodeInput
              code={
                phoneNumber.startsWith("+")
                  ? phoneNumber.split(" ")[0]
                  : defaultPhoneCode
              }
              number={
                phoneNumber.startsWith("+")
                  ? phoneNumber.split(" ").slice(1).join(" ")
                  : phoneNumber
              }
              onCodeChange={(code) => {
                const number = phoneNumber.startsWith("+")
                  ? phoneNumber.split(" ").slice(1).join(" ")
                  : phoneNumber;
                setPhoneNumber(code + (number ? " " + number : ""));
              }}
              onNumberChange={(number) => {
                const code = phoneNumber.startsWith("+")
                  ? phoneNumber.split(" ")[0]
                  : defaultPhoneCode;
                setPhoneNumber(code + (number ? " " + number : ""));
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-medium py-3 rounded-lg transition-all duration-200 ${
              isLoading
                ? "bg-[#cfc4c7] text-[#a69298] cursor-not-allowed"
                : "bg-[#552e38] text-white hover:bg-[#765860] active:bg-[#552e38]"
            }`}
          >
            {isLoading ? "Versturen..." : "OTP Versturen"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#552e38] mb-3 text-center">
              Voer de 4-cijferige OTP code in
            </label>
            <div className="flex justify-center">
              <InputOTP maxLength={4} value={otpCode} onChange={setOtpCode}>
                <InputOTPGroup>
                  <InputOTPSlot
                    index={0}
                    className="border-[rgba(207,196,199,0.5)] focus:border-[#facf59] focus:ring-[#facf59] text-[#552e38]"
                  />
                  <InputOTPSlot
                    index={1}
                    className="border-[rgba(207,196,199,0.5)] focus:border-[#facf59] focus:ring-[#facf59] text-[#552e38]"
                  />
                  <InputOTPSlot
                    index={2}
                    className="border-[rgba(207,196,199,0.5)] focus:border-[#facf59] focus:ring-[#facf59] text-[#552e38]"
                  />
                  <InputOTPSlot
                    index={3}
                    className="border-[rgba(207,196,199,0.5)] focus:border-[#facf59] focus:ring-[#facf59] text-[#552e38]"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={resetLoginFormState}
              className="flex-1 py-3 border border-[rgba(207,196,199,0.5)] text-[#765860] rounded-lg hover:bg-[#f5f2de] hover:border-[#cfc4c7] transition-all duration-200 font-medium"
            >
              Terug
            </button>
            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 4}
              className={`flex-1 font-medium py-3 rounded-lg transition-all duration-200 ${
                isLoading || otpCode.length !== 4
                  ? "bg-[#cfc4c7] text-[#a69298] cursor-not-allowed"
                  : "bg-[#552e38] text-white hover:bg-[#765860] active:bg-[#552e38]"
              }`}
            >
              {isLoading ? "Verifiëren..." : "Verifiëren"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
