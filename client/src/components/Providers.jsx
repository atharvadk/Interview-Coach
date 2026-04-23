"use client";

import { AuthProvider } from "@/context/AuthContext";
import { InterviewProvider } from "@/context/InterviewContext";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <InterviewProvider>
        {children}
        <Toaster position="top-right" />
      </InterviewProvider>
    </AuthProvider>
  );
}
