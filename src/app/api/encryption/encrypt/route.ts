// src/app/api/encryption/encrypt/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const serviceRegistry = process.env.NEXT_PUBLIC_SERVICE_REGISTRY;
    const clientId = process.env.MYMMO_CLIENT_ID;

    if (!serviceRegistry || !clientId) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { payload, token } = await request.json();

    if (!payload || !token) {
      return NextResponse.json(
        { error: "Missing payload or token" },
        { status: 400 }
      );
    }

    const response = await fetch(`${serviceRegistry}/encrypt-decrypt/encrypt`, {
      method: "POST",
      headers: {
        "x-client-id": clientId,
        "x-secret-key": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Encryption failed: ${response.status}`);
      return NextResponse.json(
        { error: "Encryption failed" },
        { status: response.status }
      );
    }

    const encryptedString = await response.text();
    const cleanEncrypted = encryptedString.replace(/^"|"$/g, "");

    return NextResponse.json({
      encrypted: cleanEncrypted,
    });
  } catch (error) {
    console.error("Encryption error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
