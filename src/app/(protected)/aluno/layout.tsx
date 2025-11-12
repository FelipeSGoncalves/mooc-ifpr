"use client";

import { useState, useEffect } from "react";
import SidebarAluno from "@/components/layout/sidebar/SidebarAluno";
import styles from "../ProtectedLayout.module.css";

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 992;
    if (isMobile) {
      setCollapsed(true);
    }
  }, []);
  

  return (
    <div className={styles.container}>
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