"use client";

import { Button, Form, Input, Typography } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import type { ValidateErrorEntity } from "rc-field-form/lib/interface";
import Link from "next/link";

import styles from "./RegisterForm.module.css";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const onFinish = (values: RegisterFormValues) => {
    console.log("Dados recebidos do formulário de cadastro:", values);
    alert(`Cadastro realizado para ${values.name}`);
  };

  const onFinishFailed = (
    errorInfo: ValidateErrorEntity<RegisterFormValues>
  ) => {
    console.log("Falha ao cadastrar:", errorInfo);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography.Title level={2} className={styles.title}>
          Cadastre-se
        </Typography.Title>
        <Typography.Paragraph className={styles.subtitle}>
          Crie sua conta para acessar os cursos e materiais exclusivos do MOOC
          IFPR.
        </Typography.Paragraph>
      </div>

      <Form
        name="register"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        className={styles.form}
      >
        <Form.Item
          label="Nome completo"
          name="name"
          rules={[{ required: true, message: "Informe seu nome completo." }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Seu nome"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Informe seu email." },
            { type: "email", message: "Digite um email válido." },
          ]}
        >
          <Input
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="seuemail@exemplo.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Senha"
          name="password"
          rules={[
            { required: true, message: "Crie uma senha." },
            { min: 6, message: "A senha deve ter pelo menos 6 caracteres." },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Digite sua senha"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Confirmar senha"
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Confirme sua senha." },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("As senhas informadas não coincidem.")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Repita sua senha"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Criar conta
          </Button>
        </Form.Item>

        <Form.Item className={styles.helper}>
          <Typography.Text>
            Já possui uma conta?{" "}
            <Link href="/auth/login" className={styles.link}>
              Entrar
            </Link>
          </Typography.Text>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterForm;
