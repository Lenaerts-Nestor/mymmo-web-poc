// src/app/api/auth/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export interface SessionData {
  personId: string;
  selectedAt: number;
  expiresAt: number;
  appLang: string;
  translationLang: string;
}

const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const COOKIE_NAME = "mymmo-session";

export async function POST(request: NextRequest) {
  try {
    const { personId, appLang, translationLang } = await request.json();

    if (!personId) {
      return NextResponse.json(
        { error: "Person ID is required" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const sessionData: SessionData = {
      personId,
      selectedAt: now,
      expiresAt: now + SESSION_DURATION,
      appLang: appLang || "nl",
      translationLang: translationLang || "nl",
    };

    // Create secure session cookie
    const response = NextResponse.json({
      success: true,
      sessionData,
    });

    response.cookies.set(COOKIE_NAME, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION / 1000, // Convert to seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Session creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionCookie = (await cookieStore).get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const sessionData: SessionData = JSON.parse(sessionCookie.value);

    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      // Clear expired session
      const response = NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    return NextResponse.json({
      success: true,
      sessionData,
    });
  } catch (error) {
    console.error("Session validation failed:", error);
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Session cleared",
    });

    response.cookies.delete(COOKIE_NAME);
    return response;
  } catch (error) {
    console.error("Session deletion failed:", error);
    return NextResponse.json(
      { error: "Failed to clear session" },
      { status: 500 }
    );
  }
}
