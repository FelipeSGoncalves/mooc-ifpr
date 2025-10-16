"use client";

import type { MenuProps } from "antd";
import { Button, Drawer, Layout, Menu } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import styles from "./HeaderPublic.module.css";

export default function HeaderPublic() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuItems: MenuProps["items"] = useMemo(
    () => [
      { key: "cursos", label: <Link href="/catalogo">Cursos</Link> },
      {
        key: "validar",
        label: <Link href="/verificar-certificado">Verificar Certificado</Link>,
      },
    ],
    [],
  );

  const selected = pathname?.startsWith("/catalogo")
    ? ["cursos"]
    : pathname?.startsWith("/verificar-certificado")
    ? ["validar"]
    : [];

  return (
    <Layout.Header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" aria-label="Página inicial">
          <div className={styles.logoWrapper}>
            <Image
              src="/icon_mooc.png"
              alt="MOOC IFPR"
              width={50}
              height={50}
              className={styles.logo}
              priority
            />
            <span className={styles.logoText}>
              MOOC <span className={styles.logoHighlight}>IFPR</span>
            </span>
          </div>
        </Link>

        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={selected}
          items={menuItems}
          className={styles.menu}
        />

        <div className={styles.buttonGroup}>
          <Link href="/auth/login">
            <Button>Entrar</Button>
          </Link>
          <Link href="/auth/cadastro">
            <Button type="primary">Cadastrar</Button>
          </Link>
        </div>

        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Abrir menu de navegação"
        >
          <MenuOutlined />
        </button>

        <Drawer
          placement="right"
          closable={false}
          onClose={() => setIsDrawerOpen(false)}
          open={isDrawerOpen}
          className={styles.drawer}
          bodyStyle={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <Menu
            mode="vertical"
            selectedKeys={selected}
            items={menuItems}
            className={styles.drawerMenu}
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className={styles.drawerButtons}>
            <Link href="/auth/login" className={styles.fullWidthLink}>
              <Button block size="large">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/cadastro" className={styles.fullWidthLink}>
              <Button type="primary" block size="large">
                Cadastrar
              </Button>
            </Link>
          </div>
        </Drawer>
      </div>
    </Layout.Header>
  );
}
