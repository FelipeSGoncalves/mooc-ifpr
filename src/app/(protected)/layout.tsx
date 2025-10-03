"use client";

import SidebarProtected from "@/components/layout/sidebar/SidebarProtected";

import styles from "./ProtectedLayout.module.css";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutContainer}>
      <SidebarProtected />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
