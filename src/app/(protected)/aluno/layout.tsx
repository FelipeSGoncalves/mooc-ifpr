"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import SidebarAluno from "@/components/layout/sidebar/SidebarAluno"; // 1. CORREÇÃO: Importando a Sidebar correta
import styles from "../ProtectedLayout.module.css"; 

// 2. CORREÇÃO: Nome do componente
export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 992;
    if (isMobile) {
      setCollapsed(true);
    }
  }, []);
  
  // 3. CORREÇÃO: Lógica de verificação para STUDENT
  useEffect(() => {
    if (!loading && user?.role !== 'STUDENT') {
      router.replace('/adm/dashboard'); 
    }
  }, [user, loading, router]);

  // 4. CORREÇÃO: Condição de renderização para STUDENT
  if (loading || user?.role !== 'STUDENT') {
    return null; 
  }

  // Renderiza o layout para o aluno
  return (
    <div className={styles.container}>
      {/* 5. CORREÇÃO: Usando o componente SidebarAluno */}
      <SidebarAluno
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}