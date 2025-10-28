"use client";

import { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Typography,
  message,
} from "antd";
import {
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ValidateErrorEntity } from "rc-field-form/lib/interface";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Dayjs } from "dayjs";

import styles from "./RegisterForm.module.css";
import { login, registerUser } from "@/services/authService";
import { ApiError } from "@/services/api";
import { setCookie } from "nookies";
import { jwtDecode } from "jwt-decode";

interface RegisterFormValues {
  fullName: string;
  cpf: string;
  birthDate?: Dayjs;
  email: string;
  password: string;
  confirmPassword: string;
}

interface DecodedToken {
  role: "ADMIN" | "STUDENT";
}

const CPF_DIGIT_COUNT = 11;
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

function sanitizeCpf(value: string): string {
  return value.replace(/\D/g, "");
}

function isValidCpf(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const digits = sanitizeCpf(value);

  if (digits.length !== CPF_DIGIT_COUNT || /^(\d)\1+$/.test(digits)) {
    return false;
  }

  const calculateDigit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };

  const firstVerifier = calculateDigit(9);
  const secondVerifier = calculateDigit(10);

  return (
    firstVerifier === Number(digits[9]) && secondVerifier === Number(digits[10])
  );
}

function extractApiErrorMessage(error: ApiError): string | null {
  const { details, message: defaultMessage } = error;

  if (details && typeof details === "object") {
    const detailRecord = details as Record<string, unknown>;
    const rawErrors = detailRecord.errors;

    if (rawErrors && typeof rawErrors === "object") {
      const fieldErrors = rawErrors as Record<
        string,
        string | string[] | undefined
      >;

      for (const value of Object.values(fieldErrors)) {
        if (!value) {
          continue;
        }

        if (Array.isArray(value)) {
          if (value.length > 0) {
            return value[0];
          }
          continue;
        }

        if (typeof value === "string" && value.trim().length > 0) {
          return value;
        }
      }
    }

    const nestedMessage = detailRecord.message;
    if (
      typeof nestedMessage === "string" &&
      nestedMessage.trim().length > 0
    ) {
      return nestedMessage;
    }
  }

  if (typeof defaultMessage === "string" && defaultMessage.trim().length > 0) {
    return defaultMessage;
  }

  return null;
}

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegisterFormValues) => {
    if (!values.birthDate) {
      message.error("Informe sua data de nascimento.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: values.fullName,
        cpf: sanitizeCpf(values.cpf),
        birthDate: values.birthDate.format("YYYY-MM-DD"),
        email: values.email,
        password: values.password,
      };

      await registerUser(payload);

      const { token } = await login({
        email: values.email,
        password: values.password,
      });

      setCookie(null, "jwt_token", token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      const decoded: DecodedToken = jwtDecode(token);
      const redirectPath =
        decoded.role === "ADMIN" ? "/adm/dashboard" : "/aluno/dashboard";

      message.success("Cadastro realizado com sucesso! Redirecionando...");
      router.push(redirectPath);
    } catch (error) {
      console.error("Falha ao cadastrar usuário:", error);
      if (error instanceof ApiError) {
        const parsedMessage = extractApiErrorMessage(error);
        message.error(
          parsedMessage ?? "Não foi possível concluir o cadastro."
        );
        return;
      }

      const errorMessage =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "Não foi possível concluir o cadastro.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
          name="fullName"
          rules={[{ required: true, message: "Informe seu nome completo." }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Seu nome"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="CPF"
          name="cpf"
          rules={[
            { required: true, message: "Informe seu CPF." },
            () => ({
              validator(_, value) {
                if (!value) {
                  return Promise.resolve();
                }

                if (isValidCpf(value)) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error("Informe um CPF válido.")
                );
              },
            }),
          ]}
        >
          <Input
            prefix={<IdcardOutlined className="site-form-item-icon" />}
            placeholder="000.000.000-00"
            size="large"
            maxLength={14}
          />
        </Form.Item>

        <Form.Item
          label="Data de nascimento"
          name="birthDate"
          rules={[{ required: true, message: "Informe sua data de nascimento." }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            size="large"
            placeholder="Selecione"
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
            {
              pattern: PASSWORD_COMPLEXITY_REGEX,
              message:
                "A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula e um número.",
            },
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
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
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
