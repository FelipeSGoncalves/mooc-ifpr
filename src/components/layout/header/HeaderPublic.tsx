import { Button, Layout, Menu } from "antd";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./HeaderPublic.module.css";

export default function HeaderPublic() {
  const pathname = usePathname();
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
          items={[
            { key: "cursos", label: <Link href="/catalogo">Cursos</Link> },
            {
              key: "validar",
              label: (
                <Link href="/verificar-certificado">Verificar Certificado</Link>
              ),
            },
          ]}
          className={styles.menu}
        />

        <div className={styles.buttonGroup}>
          <Link href="/auth/login">
            <Button>Entrar</Button>
          </Link>
          <Link href="/auth/registro">
            <Button type="primary">Cadastrar</Button>
          </Link>
        </div>
      </div>
    </Layout.Header>
  );
}
