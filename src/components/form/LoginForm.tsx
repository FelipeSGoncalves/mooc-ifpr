
import React from "react";
import { Form, Input, Button, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import Link from "next/link";
import type { ValidateErrorEntity } from "rc-field-form/lib/interface";

interface LoginFormValues {
  email: string;
  password?: string;
}

const LoginForm: React.FC = () => {
  const onFinish = (values: LoginFormValues) => {
    console.log("Dados recebidos do formulário: ", values);    // Aqui você implementaria a lógica de autenticação
    alert(`Login com Email: ${values.email}`);
  };
  const onFinishFailed = (errorInfo: ValidateErrorEntity<LoginFormValues>) => {
    console.log("Falha ao submeter:", errorInfo);
  };

  return (
    <div
      style={{
        width: 400,
        padding: "40px",
        border: "1px solid #1890ff40", // Um azul claro da paleta do AntD
        borderRadius: "8px",
        backgroundColor: "#ffffff",
      }}
    >
      <Typography.Title
        level={2}
        style={{ textAlign: "center", marginBottom: "2rem" }}
      >
        Entrar
      </Typography.Title>

      <Form
        name="login"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
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

        <Form.Item style={{ marginBottom: "1rem", textAlign: "center" }}>
          <Typography.Text>
            Não possui uma conta?{" "}
            <Link href="/registro" style={{ color: "#00A78E" }}>
              Registre-se
            </Link>
          </Typography.Text>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{ backgroundColor: "#00A78E", borderColor: "#00A78E" }}
          >
            Enviar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginForm;
