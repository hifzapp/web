"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

import { api, handleApiError } from "@/lib/api";
import AuthLoading from "@/components/ui/auth-loading";

interface GoogleAuthButtonProps {
  label?: string;
  className?: string;
}

export default function GoogleAuthButton({
  className = "",
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  return (
    <>
      {loading && <AuthLoading />}

      <div className={`mt-3 ${className}`}>
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              setLoading(true);

              const credential = credentialResponse.credential;

              if (!credential) {
                console.error(
                  "Google did not return an ID token."
                );
                setLoading(false);
                return;
              }

              const response = await api.post(
                "/auth/google",
                {
                  token: credential,
                },
                {
                  withCredentials: true,
                }
              );

              if (response.data?.user) {
                window.location.href = "/app";
                return;
              }

              setLoading(false);
            } catch (error) {
              const message = handleApiError(error);

              console.error(
                "Google login failed:",
                message
              );

              setLoading(false);
            }
          }}
          onError={() => {
            console.error("Google authentication failed.");
          }}
          useOneTap={false}
          text="continue_with"
          shape="rectangular"
          size="large"
          width="320"
        />
      </div>
    </>
  );
}