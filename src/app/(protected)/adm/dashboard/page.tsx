"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Typography, Spin, App, Row, Col, Card, List, Input, Button, Tabs, Switch, Tag, Modal, Form
} from "antd";
import {
  UserOutlined, CheckCircleOutlined, ClockCircleOutlined, PlusOutlined, EditOutlined
} from "@ant-design/icons";
import styles from "./DashboardPage.module.css";

import { apiRequest, ApiError } from "@/services/api";
import { parseCookies } from "nookies";
import {
  getKnowledgeAreas, createKnowledgeArea, updateKnowledgeArea,
  getCampuses, createCampus, updateCampus,
  ConfigItem, getAutoApproveStatus, updateAutoApproveStatus
} from "@/services/configurationService";
import { getStudentCount } from "@/services/userService";
// Importar o serviço de solicitações
import { getCertificateRequests } from "@/services/certificateRequestService";

const { Title, Text } = Typography;

// ... (Componente ManagementList permanece inalterado - mantenha o código anterior dele) ...
const ManagementList = ({ fetchItems, createItem, updateItem, itemType }: {
  fetchItems: () => Promise<{ conteudo: ConfigItem[] }>;
  createItem: (name: string) => Promise<ConfigItem>;
  updateItem: (id: number, name: string, visible: boolean) => Promise<ConfigItem>;
  itemType: string;
}) => {
  const { message } = App.useApp();
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para Adicionar
  const [newItemName, setNewItemName] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // Estado para Editar (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchItems();
      const sorted = (data.conteudo || []).sort((a, b) => a.id - b.id);
      setItems(sorted);
    } catch (error) {
      console.error(error);
      message.error(`Não foi possível carregar ${itemType}.`);
    } finally {
      setLoading(false);
    }
  }, [fetchItems, itemType, message]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const showEditModal = (item: ConfigItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      visible: item.visible
    });
    setIsModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setEditLoading(true);

      if (editingItem) {
        await updateItem(editingItem.id, values.name, values.visible);
        message.success(`${itemType.slice(0, -1)} atualizado com sucesso!`);
        setItems(prev => prev.map(i => 
          i.id === editingItem.id 
            ? { ...i, name: values.name, visible: values.visible } 
            : i
        ));
        setIsModalOpen(false);
        setEditingItem(null);
      }
    } catch (error) {
        if (!(error && typeof error === 'object' && 'errorFields' in error)) {
            message.error("Erro ao salvar alterações.");
        }
    } finally {
      setEditLoading(false);
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
          <List.Item actions={[
            <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => showEditModal(item)}>
                Editar
            </Button>
          ]}>
            <List.Item.Meta
              title={item.name}
              description={
                <Tag color={item.visible ? 'green' : 'red'}>
                  {item.visible ? 'Visível' : 'Oculto'}
                </Tag>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title={`Editar ${itemType.slice(0, -1)}`}
        open={isModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={editLoading}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" name="edit_form">
            <Form.Item name="name" label="Nome" rules={[{ required: true, message: 'Por favor, insira o nome.' }]}>
                <Input placeholder="Nome" />
            </Form.Item>
            <Form.Item name="visible" label="Status" valuePropName="checked">
                <Switch checkedChildren="Visível" unCheckedChildren="Oculto" />
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
// ... (Fim do ManagementList) ...


export default function DashboardPage() {
  const { message } = App.useApp();
  
  // Estados das estatísticas
  const [pendingRequests, setPendingRequests] = useState<number | null>(null);
  const [studentsCount, setStudentsCount] = useState<number | null>(null);
  const [approvedCertificates, setApprovedCertificates] = useState<number | null>(null); // NOVO ESTADO
  
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingCertificates, setLoadingCertificates] = useState(true); // NOVO LOADING

  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);
  const [autoApproveLoading, setAutoApproveLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = parseCookies().jwt_token;
      if (!token) return;

      // 1. Configurações
      try {
        const config = await getAutoApproveStatus();
        setAutoApproveEnabled(config.enabled);
      } catch (error) {
        console.error("Erro config:", error);
      }

      // 2. Solicitações Pendentes
      setLoadingRequests(true);
      try {
        const requestsCount = await apiRequest<number>("/certificate-requests/count/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingRequests(requestsCount);
      } catch (error) {
        console.error("Erro requests:", error);
      } finally {
        setLoadingRequests(false);
      }

      // 3. Contagem de Alunos
      setLoadingStudents(true);
      try {
        const count = await getStudentCount();
        setStudentsCount(count);
      } catch (error) {
        console.error("Erro student count:", error);
      } finally {
        setLoadingStudents(false);
      }

      // 4. Contagem de Certificados Emitidos (NOVO)
      setLoadingCertificates(true);
      try {
        // Busca apenas 1 item mas pega o totalElementos do cabeçalho de paginação
        const data = await getCertificateRequests('aprovado');
        setApprovedCertificates(data.totalElementos);
      } catch (error) {
        console.error("Erro certificates count:", error);
      } finally {
        setLoadingCertificates(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleAutoApproveChange = async (checked: boolean) => {
    setAutoApproveLoading(true);
    try {
        await updateAutoApproveStatus(checked);
        setAutoApproveEnabled(checked);
        message.success(`Aprovação automática ${checked ? 'ATIVADA' : 'DESATIVADA'}.`);
        if (checked) setPendingRequests(0);
    } catch {
        message.error("Erro ao atualizar configuração.");
        setAutoApproveEnabled(!checked);
    } finally {
        setAutoApproveLoading(false);
    }
  };

  const renderCardValue = (value: number | null, loading: boolean) => {
    if (loading) return <Spin />;
    return <Text className={styles.cardValue}>{value ?? '--'}</Text>;
  };

  const tabItems = [
    { key: '1', label: 'Áreas de Conhecimento', children: <ManagementList fetchItems={getKnowledgeAreas} createItem={createKnowledgeArea} updateItem={updateKnowledgeArea} itemType="Áreas de Conhecimento" /> },
    { key: '2', label: 'Campi', children: <ManagementList fetchItems={getCampuses} createItem={createCampus} updateItem={updateCampus} itemType="Campi" /> },
  ];

  return (
    <div className={styles.container}>
      <Title level={2} className={styles.pageTitle}>Dashboard Administrativa</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <div className={styles.card}>
            <div className={styles.cardIcon}><ClockCircleOutlined /></div>
            <div className={styles.cardContent}>
                <Text className={styles.cardTitle}>Solicitações Pendentes</Text>
                {renderCardValue(pendingRequests, loadingRequests)}
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className={styles.card}>
            <div className={styles.cardIcon}><UserOutlined /></div>
            <div className={styles.cardContent}>
                <Text className={styles.cardTitle}>Alunos Cadastrados</Text>
                {renderCardValue(studentsCount, loadingStudents)}
            </div>
          </div>
        </Col>
        {/* CARD ATUALIZADO: CERTIFICADOS EMITIDOS */}
        <Col xs={24} sm={12} md={6}>
          <div className={styles.card}>
            <div className={styles.cardIcon}><CheckCircleOutlined /></div>
            <div className={styles.cardContent}>
                <Text className={styles.cardTitle}>Certificados Emitidos</Text>
                {renderCardValue(approvedCertificates, loadingCertificates)}
            </div>
          </div>
        </Col>
      </Row>

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
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <Text strong>Aprovação automática de certificados</Text>
                    <Text type="secondary" style={{fontSize: '12px'}}>
                        Se ativo, solicitações serão aprovadas instantaneamente.
                    </Text>
                </div>
                <Switch 
                    checked={autoApproveEnabled} 
                    onChange={handleAutoApproveChange}
                    loading={autoApproveLoading}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}