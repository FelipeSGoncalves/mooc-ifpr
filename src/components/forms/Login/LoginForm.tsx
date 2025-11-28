"use client";

import { Form, Input, Button, Typography, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import styles from "./LoginForm.module.css";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useLogin";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const { authenticate, loading } = useLogin();

  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async ({ email, password }: LoginFormValues) => {
    const result = await authenticate(email, password);

    if (!result.success) {
      messageApi.error(result.error);
      return;
    }

    messageApi.success("Login realizado com sucesso!");

    router.push(
      result.role === "ADMIN" ? "/adm/dashboard" : "/aluno/dashboard"
    );
  };

  return (
    <div className={styles.container}>
      {contextHolder}

      <Typography.Title level={2} className={styles.title}>
        Entrar
      </Typography.Title>

      <Form layout="vertical" onFinish={onFinish} className={styles.form}>
        <Form.Item
          label="Email:"
          name="email"
          rules={[
            { required: true, message: "Por favor, insira seu email!" },
            { type: "email", message: "Email inválido!" },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
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
            prefix={<LockOutlined />}
            placeholder="Sua senha"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="large"
          >
            Entrar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
