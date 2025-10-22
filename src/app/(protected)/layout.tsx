"use client";

// Não precisa mais de useRouter, useEffect ou useAuth aqui!
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Apenas renderiza o conteúdo, pois o middleware já garantiu o acesso.
  return <>{children}</>;
}