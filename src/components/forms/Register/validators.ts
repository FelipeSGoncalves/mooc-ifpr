import dayjs from "dayjs";

export const sanitizeCPF = (value: string) => value.replace(/\D/g, "");

export const isValidCPF = (cpf: string) => {
  cpf = sanitizeCPF(cpf);
  if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;

  const calc = (b: number) =>
    ((cpf
      .split("")
      .slice(0, b)
      .reduce((sum, digit, i) => sum + Number(digit) * (b + 1 - i), 0) *
      10) %
      11) % 10;

  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
};

export const isValidBirthDate = (d: dayjs.Dayjs | null) => {
  if (!d || !d.isValid()) return false;
  if (d > dayjs()) return false;
  if (d < dayjs("1900-01-01")) return false;
  return true;
};

export const passwordMatch = (p: string, c: string) => p === c;
