// src/app/components/layout/sidebar/SidebarProtected.tsx

'use client';

// 1. Importe o componente Image e o tipo StaticImageData
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

// 2. Importe suas imagens da pasta assets
// O caminho relativo sobe três níveis para chegar na pasta `src`
import criarCursoIcon from '../../../../assets/criar_curso.png';
import cursosIcon from '../../../../assets/catalogo_cursos_alunos.png'; // Verifique se este é o ícone correto para "Cursos"
import dashboardIcon from '../../../../assets/dashboard_adm.png';
import solicitacoesIcon from '../../../../assets/solicitacoes_adm.png';
import userIcon from '../../../../assets/pessoasLogin.png'; // Ícone para o botão de perfil

import styles from './SidebarProtected.module.css';

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
        <div className={styles.logo}>
          MOOC IFPR
        </div>
      </div>

      <nav className={styles.nav}>
        <ul>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            
            return (
              <li key={item.name}>
                <Link href={item.path}>
                  <a className={`${styles.navLink} ${isActive ? styles.active : ''}`}>
                    {/* 5. Renderize usando o componente <Image> */}
                    <span className={styles.icon}>
                      <Image 
                        src={item.icon} 
                        alt={`${item.name} icon`} // Alt text para acessibilidade
                        width={24} // Defina a largura
                        height={24} // Defina a altura
                      />
                    </span>
                    {item.name}
                  </a>
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
                width={24}
                height={24}
            />
        </button>
      </div>
    </aside>
  );
};

export default SidebarProtected;