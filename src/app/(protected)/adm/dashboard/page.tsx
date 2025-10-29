"use client";

import { useState, useEffect } from "react";
import {
  Typography, Spin, App, Row, Col, Card, List, Input, Button, Tabs, Switch, Tag
} from "antd";
import {
  UserOutlined, CheckCircleOutlined, ClockCircleOutlined, PlusOutlined, EditOutlined
} from "@ant-design/icons";
import styles from "./DashboardPage.module.css";

import { apiRequest, ApiError } from "@/services/api";
import { parseCookies } from "nookies";
import {
  getKnowledgeAreas, createKnowledgeArea, getCampuses, createCampus, ConfigItem,
} from "@/services/configurationService";

const { Title, Text } = Typography;

// Componente ManagementList (sem alterações)
const ManagementList = ({ fetchItems, createItem, itemType }: {
  fetchItems: () => Promise<{ conteudo: ConfigItem[] }>;
  createItem: (name: string) => Promise<ConfigItem>;
  itemType: string;
}) => {
  const { message } = App.useApp();
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchItems();
      setItems(data.conteudo || []);
    } catch (error) {
      message.error(`Não foi possível carregar ${itemType}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      message.warning(`O nome não pode ser vazio.`);
      return;
    }
    setSubmitLoading(true);
    try {
      await createItem(newItemName);
      message.success(`${itemType.slice(0, -1)} adicionado com sucesso!`);
      setNewItemName("");
      fetchData();
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Ocorreu um erro.";
      message.error(`Falha ao adicionar: ${errorMessage}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.addForm}>
        <Input
          placeholder={`Nome do novo ${itemType.toLowerCase().slice(0, -1)}`}
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onPressEnter={handleAddItem}
          size="large"
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem} loading={submitLoading} size="large">
          Adicionar
        </Button>
      </div>
      <List
        loading={loading}
        dataSource={items}
        renderItem={(item) => (
          <List.Item actions={[ <Button type="text" icon={<EditOutlined />} disabled>Editar</Button> ]}>
            <List.Item.Meta
              title={item.name}
              description={<Tag color={item.visible ? 'green' : 'red'}>{item.visible ? 'Visível' : 'Oculto'}</Tag>}
            />
          </List.Item>
        )}
      />
    </div>
  );
};


export default function DashboardPage() {
  const { message } = App.useApp();
  const [pendingRequests, setPendingRequests] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingStats(true);
      try {
        const token = parseCookies().jwt_token;
        if (!token) throw new ApiError("Usuário não autenticado", 401);
        const count = await apiRequest<number>("/certificate-requests/count/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingRequests(count);
      } catch (error) {
        message.error("Não foi possível carregar o número de solicitações pendentes.");
        setPendingRequests(0);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchDashboardData();
  }, [message]);

  const renderCardValue = (value: number | null, loading: boolean) => {
    if (loading) return <Spin />;
    return <Text className={styles.cardValue}>{value ?? '...'}</Text>;
  };

  const tabItems = [
    { key: '1', label: 'Áreas de Conhecimento', children: <ManagementList fetchItems={getKnowledgeAreas} createItem={createKnowledgeArea} itemType="Áreas de Conhecimento" /> },
    { key: '2', label: 'Campi', children: <ManagementList fetchItems={getCampuses} createItem={createCampus} itemType="Campi" /> },
  ];

  return (
    <div className={styles.container}>
      <Title level={2} className={styles.pageTitle}>Dashboard Administrativa</Title>

      {/* Seção de Estatísticas (sem alteração) */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <div className={styles.card}><div className={styles.cardIcon}><ClockCircleOutlined /></div><div className={styles.cardContent}><Text className={styles.cardTitle}>Solicitações Pendentes</Text>{renderCardValue(pendingRequests, loadingStats)}</div></div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className={styles.card}><div className={styles.cardIcon}><UserOutlined /></div><div className={styles.cardContent}><Text className={styles.cardTitle}>Usuários Cadastrados</Text><Text className={styles.cardValue}>12.345</Text></div></div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className={styles.card}><div className={styles.cardIcon}><CheckCircleOutlined /></div><div className={styles.cardContent}><Text className={styles.cardTitle}>Taxa de Conclusão</Text><Text className={styles.cardValue}>68%</Text></div></div>
        </Col>
      </Row>

      {/* --- NOVA SEÇÃO DE CONFIGURAÇÕES COM TÍTULO E ESPAÇAMENTO --- */}
      <div className={styles.configSection}>
        <Title level={3} className={styles.sectionTitle}>Configurações do Admin</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Gerenciamento da Plataforma" style={{ height: '100%' }}>
              <Tabs defaultActiveKey="1" items={tabItems} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Configurações Gerais" style={{ height: '100%' }}>
              <div className={styles.settingItem}>
                <Text>Aprovação automática de certificados</Text>
                <Switch disabled />
              </div>
              
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}