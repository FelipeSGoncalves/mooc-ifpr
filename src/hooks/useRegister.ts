"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { message } from "antd";

import { registerUser, login } from "@/services/authService";
import { ApiError } from "@/services/api";
import { isValidCPF, isValidBirthDate, sanitizeCPF, passwordMatch } from "@/components/forms/Register/validators";

export interface RegisterPayload {
  fullName: string;
  cpf: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: dayjs.Dayjs;
}

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const submit = async (values: RegisterPayload) => {
    try {
      setLoading(true);

      // 🔍 Validações antes do fetch
      if (!isValidCPF(values.cpf)) {
        messageApi.error("CPF inválido.");
        return;
      }

      if (!isValidBirthDate(values.birthDate)) {
        messageApi.error("Data de nascimento inválida.");
        return;
      }

      if (!passwordMatch(values.password, values.confirmPassword)) {
        messageApi.error("As senhas não coincidem.");
        return;
      }

      // monta payload final
      const payload = {
        fullName: values.fullName.trim(),
        cpf: sanitizeCPF(values.cpf),
        email: values.email.trim(),
        password: values.password.trim(),
        birthDate: values.birthDate.format("YYYY-MM-DD"),
      };

      // 📌 Faz o cadastro
      await registerUser(payload);

      // Login automático
      const { token } = await login({
        email: payload.email,
        password: payload.password,
      });

      // salva cookie
      document.cookie = `jwt_token=${token}; path=/; max-age=${30 * 86400}`;

      messageApi.success("Cadastro realizado com sucesso!");
      window.location.href = "/aluno/dashboard";

    } catch (err: unknown) {
      console.error("Erro ao cadastrar:", err);

      if (err instanceof ApiError) {
        const details = err.details as {
          message?: string;
          errors?: Record<string, string>;
        };

        if (details?.errors) {
          const first = Object.values(details.errors)[0];
          if (first) {
            messageApi.error(first);
            return;
          }
        }

        if (details?.message) {
          messageApi.error(details.message);
          return;
        }
      }

      messageApi.error("Erro inesperado ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, contextHolder };
}
