// src/app/utils/serverAuth.ts
import { NextRequest } from "next/server";
import { SessionData } from "../api/auth/session/route";

const COOKIE_NAME = "mymmo-session";

export class ServerAuthUtils {
  /**
   * Validate session from request cookies
   */
  static validateSession(request: NextRequest): SessionData | null {
    try {
      const sessionCookie = request.cookies.get(COOKIE_NAME);

      if (!sessionCookie) {
        return null;
      }

      const sessionData: SessionData = JSON.parse(sessionCookie.value);

      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error("Session validation error:", error);
      return null;
    }
  }

  /**
   * Check if the session allows access to a specific person's data
   */
  static validatePersonAccess(request: NextRequest, personId: string): boolean {
    const session = this.validateSession(request);

    if (!session) {
      return false;
    }

    return session.personId === personId;
  }

  /**
   * Extract session from request for API routes
   */
  static getSessionFromRequest(request: NextRequest): SessionData | null {
    return this.validateSession(request);
  }
}
