
import SidebarProtected from '@/components/layout/sidebar/SidebarProtected'; // Usando alias @
import styles from '@/components/layout/sidebar/SidebarProtected.module.css'; // Vamos criar este arquivo

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutContainer}>
      <SidebarProtected />
      <main className={styles.mainContent}>
        {children} {/* As páginas da sua área protegida serão renderizadas aqui */}
      </main>
    </div>
  );
}

