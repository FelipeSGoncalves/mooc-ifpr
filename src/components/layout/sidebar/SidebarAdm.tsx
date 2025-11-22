"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

import criarCursoIcon from "@/assets/criar_curso.png";
import cursosIcon from "@/assets/catalogo_cursos_alunos.png";
import dashboardIcon from "@/assets/dashboard_adm.png";
import solicitacoesIcon from "@/assets/solicitacoes_adm.png";
import userIcon from "@/assets/icon_perfil.png";
import botaoSair from "@/assets/botao-sair.png";
import logoImage from "@/assets/logo_mooc.png";

import styles from "./Sidebar.module.css";
import { logout } from '@/services/authService'; 

type NavItem = {
  name: string;
  icon: StaticImageData;
  path: string;
};

const navItems: NavItem[] = [
  { name: "Dashboard", icon: dashboardIcon, path: "/adm/dashboard" },
  { name: "Criar Curso", icon: criarCursoIcon, path: "/adm/criar-curso" },
  { name: "Cursos", icon: cursosIcon, path: "/adm/cursos" },
  { name: "Solicitações", icon: solicitacoesIcon, path: "/adm/solicitacoes" },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarProtected: FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();


  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div>
        <div className={styles.logoContainer}>
          <Image
            src={logoImage}
            alt="MOOC IFPR Logo"
            width={150}
            height={150}
            priority
          />
        </div>

        <nav className={styles.nav}>
          <ul>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <li key={item.name} title={item.name}>
                  <Link
                    href={item.path}
                    className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                  >
                    <span className={styles.icon}>
                      <Image src={item.icon} alt={`${item.name} icon`} width={24} height={24}/>
                    </span>
                    <span className={styles.navText}>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className={styles.footer}>
        <button
            className={styles.collapseButton}
            onClick={() => logout()}
        >
            <span className={styles.icon}>
              <Image src={botaoSair} alt="User profile icon" width={24} height={24} />
            </span>
            <span className={styles.navText}>Sair</span>
        </button>
        <button
            className={styles.collapseButton}
            onClick={() => setCollapsed(!collapsed)}
        >
            <span className={styles.icon}>
                {collapsed ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
            </span>
            <span className={styles.navText}>Recolher</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarProtected;