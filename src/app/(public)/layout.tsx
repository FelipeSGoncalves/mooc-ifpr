"use client";

import { Layout } from "antd";

import FooterPublic from "@/components/layout/footer/FooterPublic";
import HeaderPublic from "@/components/layout/header/HeaderPublic";

import styles from "./layout.module.css";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout className={styles.layout}>
      <HeaderPublic />
      <Layout.Content className={styles.content}>{children}</Layout.Content>
      <FooterPublic />
    </Layout>
  );
}
