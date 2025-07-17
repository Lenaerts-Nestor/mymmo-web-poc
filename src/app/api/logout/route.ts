// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import ApiClient from "@/app/services/encryption/apiClient";

export async function POST(request: NextRequest) {
  try {
    // Clear the OAuth token cache in encryption service
    ApiClient.clearTokenCache();

    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.delete("mymmo-session");

    return response;
  } catch (error) {
    console.error("Logout failed:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
