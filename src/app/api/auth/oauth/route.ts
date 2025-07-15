// src/app/api/auth/oauth/route.ts
import { NextRequest, NextResponse } from "next/server";

interface OAuthResponse {
  data: {
    token: string;
    expires_at: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const serviceRegistry = process.env.NEXT_PUBLIC_SERVICE_REGISTRY;
    const clientSecret = process.env.MYMMO_CLIENT_SECRET;

    if (!serviceRegistry || !clientSecret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create form data for OAuth request
    const formData = new FormData();
    formData.append("client_secret", clientSecret);

    const response = await fetch(`${serviceRegistry}/oauth`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error(`OAuth request failed: ${response.status}`);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: response.status }
      );
    }

    const data: OAuthResponse = await response.json();

    return NextResponse.json({
      token: data.data.token,
      expiresAt: data.data.expires_at,
    });
  } catch (error) {
    console.error("OAuth token retrieval failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
