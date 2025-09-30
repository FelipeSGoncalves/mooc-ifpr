"use client";
import { Layout } from "antd";

export default function FooterPublic() {
  return (
    <Layout.Footer style={{ background: "#f5f5f5" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span>
          © {new Date().getFullYear()} IFPR – Campus Foz do Iguaçu • MOOC
        </span>
        <span>Certificados digitais com validação pública</span>
      </div>
    </Layout.Footer>
  );
}
