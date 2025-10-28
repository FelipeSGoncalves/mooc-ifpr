"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Spin,
  App,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import styles from "./DashboardPage.module.css";

// Importações para fazer a chamada de API diretamente
import { apiRequest, ApiError } from "@/services/api";
import { parseCookies } from "nookies";

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { message } = App.useApp();
  const [pendingRequests, setPendingRequests] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Lógica da chamada API diretamente na página
        const token = parseCookies().jwt_token;
        if (!token) {
          throw new ApiError("Usuário não autenticado", 401);
        }
        
        const count = await apiRequest<number>("/certificate-requests/count/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPendingRequests(count);

      } catch (error) {
        message.error("Não foi possível carregar o número de solicitações pendentes.");
        setPendingRequests(0); // Define como 0 em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [message]);

  const renderCardValue = (value: number | null) => {
    if (loading) {
      return <Spin />;
    }
    return <Text className={styles.cardValue}>{value ?? '...'}</Text>;
  };

  return (
    <div className={styles.container}>
      <Title level={2} className={styles.pageTitle}>Dashboard Administrativa</Title>

      <Row gutter={[16, 16]}>
        {/* Card de Solicitações Pendentes (Dado Real) */}
        <Col xs={24} sm={12} md={6}>
          <div className={styles.card}>
            <div className={styles.cardIcon}><ClockCircleOutlined /></div>
            <div className={styles.cardContent}>
              <Text className={styles.cardTitle}>Solicitações Pendentes</Text>
              {renderCardValue(pendingRequests)}
            </div>
          </div>
        </Col>

        {/* Card de Usuários (Dado Estático) */}
        <Col xs={24} sm={12} md={6}>
          <div className={styles.card}>
            <div className={styles.cardIcon}><UserOutlined /></div>
            <div className={styles.cardContent}>
              <Text className={styles.cardTitle}>Usuários Cadastrados</Text>
              <Text className={styles.cardValue}>12.345</Text>
            </div>
          </div>
        </Col>

        {/* Card de Taxa de Conclusão (Dado Estático) */}
        <Col xs={24} sm={12} md={6}>
          <div className={styles.card}>
            <div className={styles.cardIcon}><CheckCircleOutlined /></div>
            <div className={styles.cardContent}>
              <Text className={styles.cardTitle}>Taxa de Conclusão</Text>
              <Text className={styles.cardValue}>68%</Text>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}