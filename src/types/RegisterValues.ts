import { Dayjs } from "dayjs";

export interface RegisterFormValues {
  fullName: string;
  cpf: string;
  email: string;
  password: string;
  birthDate: Dayjs | null;
}
