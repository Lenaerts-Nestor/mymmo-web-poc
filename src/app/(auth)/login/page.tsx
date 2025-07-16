// src/app/(auth)/login/page.tsx
import LoginForm from "@/app/components/LoginForm";
import { QueryProvider } from "@/app/providers/QueryProvider";
import React from "react";

export default function LoginPage() {
  return (
    <QueryProvider>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
        <LoginForm />
      </div>
    </QueryProvider>
  );
}
