import { NextRequest, NextResponse } from "next/server";
import TokenService from "../../services/encryption/tokenService";

export async function POST(request: NextRequest) {
  try {
    const serviceRegistry = process.env.NEXT_PUBLIC_SERVICE_REGISTRY;

    if (!serviceRegistry) {
      console.error("NEXT_PUBLIC_SERVICE_REGISTRY not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const token = await TokenService.getOAuthToken();

    // Try different upload endpoints
    const uploadEndpoints = [
      "/service/mymmo-thread-service/uploadFile",
      "/service/mymmo-file-service/upload",
      "/service/file-service/upload",
      "/upload",
      "/api/upload-file",
    ];

    console.log("Trying to upload file to backend...");
    let lastError;

    for (const endpoint of uploadEndpoints) {
      try {
        console.log(`Attempting upload to: ${serviceRegistry}${endpoint}`);

        const response = await fetch(`${serviceRegistry}${endpoint}`, {
          method: "POST",
          headers: {
            "x-client-id": "1",
            "x-secret-key": token,
          },
          body: formData,
        });

        console.log(`Response from ${endpoint}: ${response.status}`);

        if (response.ok) {
          const result = await response.json();
          console.log("Upload successful:", result);
          return NextResponse.json(result);
        } else {
          const errorText = await response.text();
          lastError = `${endpoint}: ${response.status} - ${errorText}`;
          console.log(`Failed ${endpoint}:`, lastError);
        }
      } catch (error) {
        lastError = `${endpoint}: ${error}`;
        console.log(`Error ${endpoint}:`, error);
        continue;
      }
    }

    console.error("All upload endpoints failed:", lastError);
    return NextResponse.json(
      { error: `All upload endpoints failed. Last error: ${lastError}` },
      { status: 500 }
    );
  } catch (error) {
    console.error("File upload failed:", error);
    return NextResponse.json(
      { error: "File upload failed", details: error },
      { status: 500 }
    );
  }
}
