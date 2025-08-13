import Image from 'next/image';
import LoginForm from './LoginForm';
import styles from './login.module.css';

export default function LoginPage() {
  return (
    <div className={styles.page}>
      {/* Painel esquerdo */}
      <div className={styles.leftPanel}>
        <p className={styles.leftQuote}>
          Aprender é o primeiro passo para se tornar quem você sempre sonhou ser.
        </p>
        <Image
          src="/pessoasLogin.png"
          alt="Pessoas estudando em um ambiente de MOOC"
          width={600}
          height={400}
          className={styles.leftImage}
          priority
        />
      </div>

      {/* Painel direito */}
      <div className={styles.rightPanel}>
        <LoginForm />
      </div>
    </div>
  );
}
