import { useState } from "react";
import { login } from "@/services/authService";
import { ApiError } from "@/services/api";
import { setCookie } from "nookies";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  role: "ADMIN" | "STUDENT";
}

export function useLogin() {
  const [loading, setLoading] = useState(false);

  const authenticate = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { token } = await login({ email, password });
      const decoded: DecodedToken = jwtDecode(token);

      setCookie(null, "jwt_token", token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      return {
        success: true,
        role: decoded.role,
        error: null,
      };
    } catch (err: unknown) {
      let apiMessage = "Erro inesperado ao tentar autenticar.";

      if (err instanceof ApiError) {
        apiMessage = err.message || "Erro desconhecido.";
      }

      return {
        success: false,
        role: null,
        error: apiMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return { authenticate, loading };
}
