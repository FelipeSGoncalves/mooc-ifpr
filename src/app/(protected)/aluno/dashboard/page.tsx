"use client";

import { Typography } from "antd";
import styles from "./DashboardPage.module.css";

const { Title, Paragraph } = Typography;

export default function AlunoDashboardPage() {
  return (
    <div className={styles.container}>
      <Title level={2}>Dashboard do Aluno</Title>
      
      <section className={styles.section}>
        <Title level={3}>Cursos em Andamento</Title>
        <div className={styles.placeholder}>
          <Paragraph>
            Aqui serão exibidos os cursos em que você está matriculado.
          </Paragraph>
        </div>
      </section>
      
      <section className={styles.section}>
        <Title level={3}>Sugestões de Cursos</Title>
        <div className={styles.placeholder}>
          <Paragraph>
            Em breve, você verá sugestões de novos cursos para continuar aprendendo.
          </Paragraph>
        </div>
      </section>
    </div>
  );
}