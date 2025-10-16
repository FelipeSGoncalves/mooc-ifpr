import Link from "next/link";

import styles from "./page.module.css";

type CursoPageProps = {
  params: {
    id: string;
  };
};

function formatTitle(slug: string) {
  const decoded = decodeURIComponent(slug.replace(/\+/g, "%20"));
  const words = decoded
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return words.join(" ") || "Curso";
}

export default function CursoDetalhes({ params }: CursoPageProps) {
  const courseTitle = formatTitle(params.id);

  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{courseTitle}</h1>
        <p className={styles.description}>
          Esta página exibirá as informações completas do curso selecionado assim que forem
          disponibilizadas. Enquanto isso, você pode retornar ao catálogo para continuar explorando
          outras opções de aprendizagem.
        </p>
        <Link href="/catalogo" className={styles.link}>
          ← Voltar para o catálogo de cursos
        </Link>
      </div>
    </section>
  );
}
