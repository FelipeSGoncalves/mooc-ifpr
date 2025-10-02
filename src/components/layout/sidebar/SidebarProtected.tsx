// src/app/components/layout/sidebar/SidebarProtected.tsx

'use client';

// 1. Importe o componente Image e o tipo StaticImageData
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

// 2. Importe suas imagens da pasta assets
// O caminho relativo sobe três níveis para chegar na pasta `src`
import criarCursoIcon from '@/assets/criar_curso.png';
import cursosIcon from '@/assets/catalogo_cursos_alunos.png'; // Verifique se este é o ícone correto para "Cursos"
import dashboardIcon from '@/assets/dashboard_adm.png';
import solicitacoesIcon from '@/assets/solicitacoes_adm.png';
import userIcon from '@/assets/icon_perfil.png'; // Ícone para o botão de perfil
import logoImage from '@/assets/logo_mooc.png';

import styles from "./SidebarProtected.module.css";

// 3. Atualize o tipo: 'icon' agora é do tipo StaticImageData
type NavItem = {
  name: string;
  icon: StaticImageData; // Este é o tipo para imagens importadas
  path: string;
};

// 4. Use as imagens importadas no seu array de navegação
const navItems: NavItem[] = [
  { name: 'Dashboard', icon: dashboardIcon, path: '/dashboard' },
  { name: 'Criar Curso', icon: criarCursoIcon, path: '/criar-curso' },
  { name: 'Cursos', icon: cursosIcon, path: '/cursos' },
  { name: 'Solicitações', icon: solicitacoesIcon, path: '/solicitacoes' },
];

const SidebarProtected: FC = () => {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
         <Image 
          src={logoImage}
          alt="MOOC IFPR Logo"
          width={150} // Você pode ajustar a largura
          height={150} // Você pode ajustar a altura
          priority // Ajuda a carregar a imagem principal mais rápido
        />
      </div>

      <nav className={styles.nav}>
        <ul>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            
            return (
              <li key={item.name}>
                <Link 
                  href={item.path}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  <span className={styles.icon}>
                    <Image 
                      src={item.icon} 
                      alt={`${item.name} icon`}
                      width={24}
                      height={24}
                    />
                  </span>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.profileContainer}>
        <button className={styles.profileButton}>
            <Image 
                src={userIcon}
                alt="User profile icon"
                width={44}
                height={44}
            />
        </button>
      </div>
    </aside>
  );
};

export default SidebarProtected;