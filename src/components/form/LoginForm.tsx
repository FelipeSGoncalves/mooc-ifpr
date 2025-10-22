"use client";

import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import type { ValidateErrorEntity } from "rc-field-form/lib/interface";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./LoginForm.module.css";
import { login } from "@/services/authService";
import { setCookie } from 'nookies';
import { jwtDecode } from 'jwt-decode';

interface LoginFormValues {
  email: string;
  password: string;
}

interface DecodedToken {
  role: 'ADMIN' | 'STUDENT';
}

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const { token } = await login(values);

      const decoded: DecodedToken = jwtDecode(token);
      
      setCookie(null, 'jwt_token', token, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: '/',
      });

      message.success("Login realizado com sucesso!");

      const redirectPath = decoded.role === 'ADMIN' ? '/adm/dashboard' : '/aluno/dashboard';
      router.push(redirectPath);

    } catch (error) {
      console.error("Falha ao autenticar:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o login.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ADICIONADO: A função que estava faltando.
  // Ela é chamada se o formulário falhar na validação (ex: campos vazios).
  const onFinishFailed = (errorInfo: ValidateErrorEntity<LoginFormValues>) => {
    console.log("Falha na validação do formulário:", errorInfo);
  };

  return (
    <div className={styles.container}>
      <Typography.Title level={2} className={styles.title}>
        Entrar
      </Typography.Title>

      <Form
        name="login"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed} // Agora a função existe
        autoComplete="off"
        className={styles.form}
      >
        <Form.Item
          label="Email:"
          name="email"
          rules={[
            { required: true, message: "Por favor, insira seu email!" },
            { type: "email", message: "O email inserido não é válido!" },
          ]}
        >
          <Input
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="seuemail@exemplo.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Senha:"
          name="password"
          rules={[{ required: true, message: "Por favor, insira sua senha!" }]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Sua senha"
            size="large"
          />
        </Form.Item>

        <Form.Item className={styles.helper}>
          <Typography.Text>
            Não possui uma conta?{" "}
            <Link href="/auth/cadastro" className={styles.link}>
              Cadastre-se
            </Link>
          </Typography.Text>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
            Entrar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginForm;