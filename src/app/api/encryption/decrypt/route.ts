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

    const { encrypted, token } = await request.json();

    if (!encrypted || !token) {
      return NextResponse.json(
        { error: "Missing encrypted data or token" },
        { status: 400 }
      );
    }

    const response = await fetch(`${serviceRegistry}/encrypt-decrypt/decrypt`, {
      method: "POST",
      headers: {
        "x-client-id": clientId,
        "x-secret-key": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(encrypted),
    });

    if (!response.ok) {
      console.error(`Decryption failed: ${response.status}`);
      return NextResponse.json(
        { error: "Decryption failed" },
        { status: response.status }
      );
    }

    const decryptedData = await response.json();

    return NextResponse.json({
      decrypted: decryptedData,
    });
  } catch (error) {
    console.error("Decryption error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
