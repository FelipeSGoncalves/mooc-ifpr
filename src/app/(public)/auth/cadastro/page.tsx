"use client";

import RegisterForm from "@/components/form/RegisterForm";

import styles from "./page.module.css";

export default function Cadastro() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <RegisterForm />
      </div>
    </section>
  );
}
