"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";


import dashboardIcon from "@/assets/dashboard_adm.png"; 
import catalogoIcon from "@/assets/catalogo_cursos_alunos.png";
import meusCursosIcon from "@/assets/meus_cursos_alunos.png";
import certificadosIcon from "@/assets/certificados_alunos.png";
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
  { name: "Dashboard", icon: dashboardIcon, path: "/aluno/dashboard" },
  { name: "Catálogo Cursos", icon: catalogoIcon, path: "/aluno/cursos" },
  { name: "Meus cursos", icon: meusCursosIcon, path: "/aluno/meus-cursos" },
  { name: "Certificados", icon: certificadosIcon, path: "/aluno/certificados" },
];
interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarAluno: FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
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
        <div className={styles.profileContainer}>
          <Link 
            href="/aluno/perfil" 
            className={`${styles.navLink} ${pathname.startsWith('/aluno/perfil') ? styles.active : ''}`}
          >
            <span className={styles.icon}>
              <Image src={userIcon} alt="User profile icon" width={24} height={24} />
            </span>
            <span className={styles.navText}>Perfil</span>
          </Link>
        </div>
        <button
            className={styles.profileButton} 
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

export default SidebarAluno;