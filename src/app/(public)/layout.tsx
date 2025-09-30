"use client";
import { Layout } from "antd";
import HeaderPublic from "@/components/layout/HeaderPublic";
import FooterPublic from "@/components/layout/FooterPublic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderPublic />
      <Layout.Content
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          padding: "16px",
        }}
      >
        {children}
      </Layout.Content>
      <FooterPublic />
    </Layout>
  );
}
