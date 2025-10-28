"use client";

import { Button, Drawer, Layout } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./HeaderPublic.module.css";
import logoIcon from "./../../../assets/logo_mooc.png";

export default function HeaderPublic() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuItems = [
    { key: "/catalogo", label: "Cursos" },
    { key: "/verificar-certificado", label: "Verificar Certificado" },
  ];

  const selectedKey = menuItems.find(item => pathname.startsWith(item.key))?.key;

  return (
    <Layout.Header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" aria-label="Página inicial" className={styles.logoWrapper}>
          <Image src={logoIcon} alt="MOOC IFPR" width={130} height={130} priority />
        </Link>

        <nav className={styles.desktopNav}>
          {menuItems.map(item => (
            <Link key={item.key} href={item.key} className={`${styles.navLink} ${selectedKey === item.key ? styles.active : ''}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.buttonGroup}>
          <Link href="/auth/login">
            <Button type="text" className={styles.loginButton} style={{ color: 'white' }}>Entrar</Button>
          </Link>
          <Link href="/auth/cadastro">
            <Button type="primary" className={styles.registerButton}>Cadastrar</Button>
          </Link>
        </div>

        <button type="button" className={styles.mobileToggle} onClick={() => setIsDrawerOpen(true)} aria-label="Abrir menu">
          <MenuOutlined />
        </button>

        <Drawer placement="right" onClose={() => setIsDrawerOpen(false)} open={isDrawerOpen} className={styles.drawer}>
          <nav className={styles.drawerNav}>
            {menuItems.map(item => (
              <Link key={item.key} href={item.key} className={styles.drawerLink} onClick={() => setIsDrawerOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className={styles.drawerButtons}>
            <Link href="/auth/login" className={styles.fullWidthLink}><Button block size="large">Entrar</Button></Link>
            <Link href="/auth/cadastro" className={styles.fullWidthLink}><Button type="primary" block size="large">Cadastrar</Button></Link>
          </div>
        </Drawer>
      </div>
    </Layout.Header>
  );
}