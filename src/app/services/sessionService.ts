// src/app/services/sessionService.ts
import { SessionData } from "../types/ouath/session";
import MyMMOApiZone from "./mymmo-service/apiZones";

class SessionService {
  /**
   * Create a new session after person selection
   * This will now fetch personName from the API and store it in the session
   */
  static async createSession(
    personId: string,
    appLang: string,
    translationLang: string
  ): Promise<SessionData> {
    try {
      console.log("SessionService: Creating session for person", personId);

      // First, fetch person data to get the personName
      let personName = `Person ${personId}`;

      try {
        const personIdNum = parseInt(personId);
        console.log("SessionService: Fetching person data for", personIdNum);

        const zonesResponse = await MyMMOApiZone.getZonesByPerson(
          personIdNum,
          personIdNum,
          translationLang
        );

        if (zonesResponse.data.person?.[0]) {
          const person = zonesResponse.data.person[0];
          personName = `${person.firstName} ${person.lastName}`;
          console.log("SessionService: Person name retrieved:", personName);
        }
      } catch (error) {
        console.warn(
          "SessionService: Failed to fetch person name, using fallback:",
          error
        );
        // Continue with fallback personName
      }

      console.log("SessionService: Creating session with data:", {
        personId,
        personName,
        appLang,
        translationLang,
      });

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personId,
          personName,
          appLang,
          translationLang,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create session");
      }

      const { sessionData } = await response.json();
      console.log("SessionService: Session created successfully:", sessionData);
      return sessionData;
    } catch (error) {
      console.error("SessionService: Session creation failed:", error);
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
