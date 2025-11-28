"use client";

import { Form, Input, Button, Typography, DatePicker } from "antd";
import dayjs from "dayjs";
import {
  UserOutlined,
  IdcardOutlined,
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons";

import styles from "./RegisterForm.module.css";
import { useRegister } from "@/hooks/useRegister";

export default function RegisterForm() {
  const [form] = Form.useForm();
  const { submit, loading, contextHolder } = useRegister();

  return (
    <div className={styles.container}>
      {contextHolder}

      <Typography.Title level={2} className={styles.title}>
        Cadastro
      </Typography.Title>

      <Form form={form} layout="vertical" onFinish={submit} className={styles.form}>


        <Form.Item label="Nome completo:" name="fullName" rules={[{ required: true, message: "Digite seu nome completo" }]}>
          <Input prefix={<UserOutlined />} size="large" placeholder="Seu nome" />
        </Form.Item>

        <Form.Item label="CPF:" name="cpf" rules={[{ required: true, message: "Digite seu CPF" }]}>
          <Input prefix={<IdcardOutlined />} size="large" maxLength={14} placeholder="000.000.000-00" />
        </Form.Item>

        <Form.Item label="Data de nascimento:" name="birthDate" rules={[{ required: true, message: "Selecione sua data de nascimento" }]}>
          <DatePicker format="DD/MM/YYYY" size="large" style={{ width: "100%" }} disabledDate={(d) => d && (d > dayjs() || d < dayjs("1900-01-01"))}
          />
        </Form.Item>

        <Form.Item
          label="Email:"
          name="email"
          rules={[
            { required: true, message: "Digite seu email" },
            { type: "email", message: "Email inválido" },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            size="large"
            placeholder="seuemail@exemplo.com"
          />
        </Form.Item>

        <Form.Item
          label="Senha:"
          name="password"
          rules={[{ required: true, message: "Digite sua senha" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            size="large"
            placeholder="SuaSenha#001"
          />
        </Form.Item>

        <Form.Item
          label="Confirmar senha:"
          name="confirmPassword"
          rules={[{ required: true, message: "Confirme sua senha" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            size="large"
            placeholder="Confirme a senha"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={loading}
        >
          Cadastrar
        </Button>
      </Form>
    </div>
  );
}
