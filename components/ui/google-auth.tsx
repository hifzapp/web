"use client";

import { GoogleLogin } from "@react-oauth/google";
import { api, handleApiError } from "@/lib/api";

interface GoogleAuthButtonProps {
  label?: string;
  className?: string;
}

export default function GoogleAuthButton({
  className = "",
}: GoogleAuthButtonProps) {
  return (
    <div className={`mt-3 ${className}`}>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const credential = credentialResponse.credential;

            if (!credential) {
              console.error("Google did not return an ID token.");
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
            }
          } catch (error) {
            const message = handleApiError(error);
            console.error("Google login failed:", message);
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
  );
}
