"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { parseCookies } from 'nookies'; // Importar o parseCookies

interface User {
  userId: number;
  fullName: string;
  role: 'ADMIN' | 'STUDENT';
}

interface DecodedToken {
  userId: number;
  fullName: string;
  role: User['role'];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // CORREÇÃO: Lendo o token dos cookies em vez do localStorage
      const cookies = parseCookies();
      const token = cookies.jwt_token;

      if (token) {
        const decodedToken = jwtDecode<DecodedToken>(token);
        setUser({
            userId: decodedToken.userId,
            fullName: decodedToken.fullName,
            role: decodedToken.role 
        });
      }
    } catch (error) {
      console.error("Falha ao processar o token:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);