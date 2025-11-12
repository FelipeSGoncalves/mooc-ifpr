'use client';

import LoginForm from "@/components/form/LoginForm";
import styles from "./page.module.css";

export default function Login() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <LoginForm />
      </div>
    </section>
  );
}
