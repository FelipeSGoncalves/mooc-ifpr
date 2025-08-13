'use client';

import { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import styles from './login.module.css';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: substitua pela sua integração real
      await new Promise((r) => setTimeout(r, 600));
      console.log('login ok', { username, password });
    } finally {
      setLoading(false);
    }
  }

  const title = (
    <div className={styles.cardTitleBox}>
      <h1 className={styles.cardTitle}>Login</h1>
    </div>
  );

  return (
    <Card title={title} className={styles.card}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="username" className={styles.label}>Usuário</label>
        <InputText
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
        />

        <label htmlFor="password" className={styles.label}>Senha</label>
        <Password
          inputId="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          toggleMask
          feedback={false}
          inputClassName={styles.input}
        />

        <a href="#" className={styles.forgotLink}>
          Esqueceu ou deseja alterar sua senha?
        </a>

        <Button
          label={loading ? 'Entrando...' : 'Acessar'}
          className={styles.submitBtn}
          type="submit"
          disabled={loading}
        />
      </form>
    </Card>
  );
}
