"use client";

import { Layout } from "antd";

import styles from "./FooterPublic.module.css";

export default function FooterPublic() {
  return (
    <Layout.Footer className={styles.footer}>
      <div className={styles.container}>
        <span>
          © {new Date().getFullYear()} IFPR – Campus Foz do Iguaçu • MOOC
        </span>
        <span>Certificados digitais com validação pública</span>
      </div>
    </Layout.Footer>
  );
}
