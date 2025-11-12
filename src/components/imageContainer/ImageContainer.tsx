import Image from "next/image";

import pessoasLogin from "@/assets/pessoasLogin.png";

import styles from "./ImageContainer.module.css";

export default function ImageContainer() {
  return (
    <div className={styles.container}>
      <div className={styles.textGroup}>
        <p className={styles.subtitle}>Aprender é o primeiro passo para se tornar</p>
        <p className={styles.highlight}>quem você sempre sonhou ser</p>
      </div>

      <div className={styles.brandGroup}>
        <span className={styles.brandPrimary}>MOOC</span>
        <span className={styles.brandSecondary}>IFPR</span>
      </div>

      <p className={styles.description}>
        Cursos gratuitos, certificados reconhecidos e uma comunidade acessível para
        você crescer no seu ritmo.
      </p>

      <div className={styles.imageWrapper}>
        <Image
          src={pessoasLogin}
          alt="Ilustração de pessoas estudando online"
          priority
          sizes="(max-width: 991px) 100vw, 420px"
          className={styles.image}
        />
      </div>
    </div>
  );
}
