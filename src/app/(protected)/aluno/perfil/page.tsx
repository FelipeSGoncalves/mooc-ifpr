"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Spin,
  Empty,
  App,
  Descriptions,
  Card,
  Button,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs"; // Biblioteca para formatar datas
import styles from "./PerfilPage.module.css";

import { getCurrentUserDetails, UserDetails } from "@/services/userService";

const { Title } = Typography;

export default function PerfilPage() {
  const { message } = App.useApp();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Simulação de endpoint, pois ele não existe no backend
        // const data = await getCurrentUserDetails();
        
        // --- DADOS MOCADOS (Temporário) ---
        // Substituir pela linha comentada acima quando o backend tiver o endpoint GET /users/me
        const mockData: UserDetails = {
            id: 1,
            fullName: "Aluno Teste",
            cpf: "111.111.111-11",
            birthDate: "2000-06-15",
            email: "estudante@mooc.ifpr.edu.br",
            active: true,
            createdAt: "2023-10-27T10:00:00Z"
        };
        await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay da rede
        setUser(mockData);
        // --- FIM DOS DADOS MOCADOS ---

      } catch (error) {
        // Este `catch` funcionará quando o endpoint real for usado
        message.error("Não foi possível carregar os dados do seu perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [message]);

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.spinContainer}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <Empty description="Não foi possível carregar as informações do perfil." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Title level={2}>Meu Perfil</Title>
      <Card>
        <Descriptions
          title="Dados Pessoais"
          bordered
          column={{ xs: 1, sm: 1, md: 2 }}
          extra={<Button icon={<EditOutlined />} disabled>Editar Perfil</Button>}
        >
          <Descriptions.Item label="Nome Completo">{user.fullName}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="CPF">{formatCPF(user.cpf)}</Descriptions.Item>
          <Descriptions.Item label="Data de Nascimento">
            {dayjs(user.birthDate).format("DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Membro desde">
            {dayjs(user.createdAt).format("DD/MM/YYYY")}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}