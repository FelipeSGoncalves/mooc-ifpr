"use client";

import { useState, useEffect } from "react";
import SidebarAdm from "@/components/layout/sidebar/SidebarAdm";
import styles from "../ProtectedLayout.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 992;
    if (isMobile) {
      setCollapsed(true);
    }
  }, []);
  
  return (
    <div className={styles.container}>
      <SidebarAdm
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}