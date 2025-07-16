// src/app/services/sessionService.ts

import { SessionData } from "../types/ouath/session";

class SessionService {
  /**
   * Create a new session after person selection
   */
  static async createSession(
    personId: string,
    appLang: string,
    translationLang: string
  ): Promise<SessionData> {
    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personId,
          appLang,
          translationLang,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create session");
      }

      const { sessionData } = await response.json();
      return sessionData;
    } catch (error) {
      console.error("Session creation failed:", error);
      throw error;
    }
  }

  /**
   * Get current session data
   */
  static async getSession(): Promise<SessionData | null> {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
      });

      if (!response.ok) {
        return null;
      }

      const { sessionData } = await response.json();
      return sessionData;
    } catch (error) {
      console.error("Session retrieval failed:", error);
      return null;
    }
  }

  /**
   * Clear current session
   */
  static async clearSession(): Promise<void> {
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Session clearing failed:", error);
    }
  }

  /**
   * Logout and clear all session data
   */
  static async logout(): Promise<void> {
    try {
      // Clear session cookie via the session endpoint
      await fetch("/api/auth/session", {
        method: "DELETE",
      });

      // Clear OAuth tokens and other logout cleanup
      await fetch("/api/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  /**
   * Check if user has permission to access a specific person's data
   */
  static async validatePersonAccess(personId: string): Promise<boolean> {
    try {
      const session = await this.getSession();

      if (!session) {
        return false;
      }

      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        await this.clearSession();
        return false;
      }

      return session.personId === personId;
    } catch (error) {
      console.error("Person access validation failed:", error);
      return false;
    }
  }
}

export default SessionService;
