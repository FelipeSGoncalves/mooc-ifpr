import { Dayjs } from "dayjs";

export const sanitizeCPF = (value: string) => value.replace(/\D/g, "");

export const isValidCPF = (cpf: string) => {
  cpf = sanitizeCPF(cpf);

  if (cpf.length !== 11) return false;
  if (/^([0-9])\1+$/.test(cpf)) return false;

  const calcDigit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) {
      sum += Number(cpf[i]) * (len + 1 - i);
    }
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };

  const d1 = calcDigit(9);
  const d2 = calcDigit(10);

  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
};

export const buildRegisterPayload = (values: {
  fullName: string;
  cpf: string;
  email: string;
  password: string;
  birthDate: Dayjs | null;
}) => ({
  fullName: values.fullName.trim(),
  cpf: sanitizeCPF(values.cpf),
  email: values.email.trim(),
  password: values.password.trim(),
  birthDate: values.birthDate
    ? values.birthDate.format("YYYY-MM-DD")
    : "",
});

