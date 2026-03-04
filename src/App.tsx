import React from "react";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthScreen } from '@/pages/AuthScreen';
import { useAuth } from '@/contexts/AuthContext';

function AppInner() {
  const { user } = useAuth();
  if (!user) return <AuthScreen />;
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "16px",
              fontSize: "0.875rem",
              fontWeight: 500,
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
