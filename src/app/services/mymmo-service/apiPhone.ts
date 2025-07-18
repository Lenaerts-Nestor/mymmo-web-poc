import ApiClient from "../encryption/apiClient";
import {
  SendOtpPayload,
  SendOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "../../types/apiEndpoints";

class MyMMOApiPhone {
  /**
   * Send OTP
   * Endpoint: /service/mymmo-service/sendOtp
   */
  static async sendOtp(payload: SendOtpPayload): Promise<SendOtpResponse> {
    try {
      const response = await ApiClient.secureApiCall<SendOtpResponse>(
        "/service/mymmo-service/sendOtp",
        payload
      );

      return response;
    } catch (error) {
      console.error("sendOtp failed:", error);
      throw error;
    }
  }

  /**
   * Verify OTP
   * Endpoint: /service/mymmo-service/verifyOtp
   */
  static async verifyOtp(
    payload: VerifyOtpPayload
  ): Promise<VerifyOtpResponse> {
    try {
      const response = await ApiClient.secureApiCall<VerifyOtpResponse>(
        "/service/mymmo-service/verifyOtp",
        payload
      );

      return response;
    } catch (error) {
      console.error("verifyOtp failed:", error);
      throw error;
    }
  }
}

export default MyMMOApiPhone;
