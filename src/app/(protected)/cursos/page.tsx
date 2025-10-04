import styles from "./CursosPage.module.css";

export default function CursosPage() {
  return (
    <div>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Cursos Ativos</h2>
          <p className={styles.cardValue}>12</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Novas Solicitações</h2>
          <p className={styles.cardValue}>5</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Alunos Inscritos</h2>
          <p className={styles.cardValue}>248</p>
        </div>
      </div>
    </div>
  );
}
