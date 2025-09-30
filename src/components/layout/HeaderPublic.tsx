"use client";
import { Layout, Menu, Button } from "antd";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function HeaderPublic() {
  const pathname = usePathname();
  const selected = pathname?.startsWith("/catalogo")
    ? ["cursos"]
    : pathname?.startsWith("/verificar-certificado")
    ? ["validar"]
    : [];

  return (
    <Layout.Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#0B261C",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <Link href="/" aria-label="Página inicial">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image
              src="/logo-ifpr.svg"
              alt="MOOC IFPR"
              width={28}
              height={28}
            />
            <span style={{ color: "#fff", fontWeight: 700 }}>
              MOOC <span style={{ color: "#93f9b9" }}>IFPR</span>
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
          style={{ flex: 1, background: "transparent" }}
        />

        <div style={{ display: "flex", gap: 8 }}>
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
