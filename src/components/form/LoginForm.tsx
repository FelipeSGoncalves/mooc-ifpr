"use client";

import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import type { ValidateErrorEntity } from "rc-field-form/lib/interface";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./LoginForm.module.css";
import { login } from "@/services/authService";

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const { token } = await login(values);
      localStorage.setItem("jwt_token", token);
      message.success("Login realizado com sucesso!");
      router.push("/dashboard");
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
  const onFinishFailed = (errorInfo: ValidateErrorEntity<LoginFormValues>) => {
    console.log("Falha ao submeter:", errorInfo);
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
        onFinishFailed={onFinishFailed}
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
