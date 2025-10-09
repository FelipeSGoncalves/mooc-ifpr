"use client";

import { useState, useEffect } from "react"; // Adicionado 'useEffect'
import SidebarProtected from "@/components/layout/sidebar/SidebarProtected";
import styles from "./ProtectedLayout.module.css";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // ADICIONADO: Este useEffect define o estado inicial correto em telas de celular
  useEffect(() => {
    const isMobile = window.innerWidth < 992;
    if (isMobile) {
      setCollapsed(true);
    }
  }, []); // O array vazio [] garante que este código só execute uma vez, na montagem do componente.

  return (
    <div className={styles.container}>
      <SidebarProtected
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}