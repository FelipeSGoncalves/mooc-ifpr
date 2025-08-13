// src/components/Header.tsx
'use client'; // Necessário pois usaremos componentes interativos como Button

import Link from 'next/link';
import Image from 'next/image';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';

export default function Header() {
  // Conteúdo da esquerda (start)
  const startContent = (
    <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Image
        src="/logoMoocIFPR.png" // CORREÇÃO 1: Caminho ajustado.
        alt="Logo IFPR"
        width={100} 
        height={100}
      />
      
    </Link>
  );

  // Conteúdo do centro (center)
  const centerContent = (
    <div className="p-d-flex p-gap-2">
      <Link href="/cursos" passHref>
        <Button label="Cursos" text style={{ color: '#495057' }} />
      </Link>
        <Link href="/login" passHref>
        <Button label="Login" text style={{ color: '#495057' }} />
      </Link>
      <Link href="/sobre" passHref>
        <Button label="Sobre" text style={{ color: '#495057' }} />
      </Link>
    </div>
  );

  // Conteúdo da direita (end)
  const endContent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Avatar icon="pi pi-user" shape="circle" />
      <span>Meu Perfil</span>
    </div>
  );

  return (
    // Usamos um estilo para adicionar uma sombra e cor de fundo
    <div style={{ borderBottom: '1px solid #e5e7eb' }}>
      <Toolbar
        start={startContent}
        center={centerContent}
        end={endContent}
        style={{ backgroundColor: '#ffffff', padding: '0.5rem 2rem', borderRadius: '0' }}
      />
    </div>
  );
}