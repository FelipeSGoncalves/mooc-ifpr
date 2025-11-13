"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Typography,
  App,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Radio,
  Empty,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./SolicitacoesPage.module.css";

import { getCertificateRequests, updateCertificateRequestStatus, CertificateRequest } from "@/services/certificateRequestService";
import { ApiError } from "@/services/api";

const { Title } = Typography;
const { TextArea } = Input;

export default function SolicitacoesPage() {
  const { message, modal } = App.useApp();
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'analise' | 'aprovado' | 'reprovado' | undefined>('analise');
  
  const fetchRequests = useCallback(async (status?: 'analise' | 'aprovado' | 'reprovado') => {
    setLoading(true);
    try {
      const data = await getCertificateRequests(status);
      setRequests(data.conteudo || []);
    } catch (error) {
      message.error("Não foi possível carregar as solicitações.");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchRequests(filterStatus);
  }, [fetchRequests, filterStatus]);

  const handleApprove = async (request: CertificateRequest) => {
    try {
      await updateCertificateRequestStatus(request.id, 'aprovado');
      message.success(`Solicitação de "${request.student.fullName}" aprovada!`);
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Ocorreu um erro.";
      message.error(`Falha ao aprovar: ${errorMessage}`);
    }
  };

  const handleReject = (request: CertificateRequest) => {
    let rejectionReason = "";
    modal.confirm({
      title: 'Reprovar Solicitação',
      content: (
        <>
          <p>Tem certeza que deseja reprovar a solicitação de &quot;{request.student.fullName}&quot;?</p>
          <TextArea
            rows={3}
            placeholder="Digite o motivo da reprovação (opcional)"
            onChange={(e) => (rejectionReason = e.target.value)}
          />
        </>
      ),
      okText: "Confirmar Reprovação",
      okType: 'danger',
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await updateCertificateRequestStatus(request.id, 'reprovado', rejectionReason);
          message.success(`Solicitação reprovada com sucesso!`);
          setRequests(prev => prev.filter(r => r.id !== request.id));
        } catch (error) {
          const errorMessage = error instanceof ApiError ? error.message : "Ocorreu um erro.";
          message.error(`Falha ao reprovar: ${errorMessage}`);
        }
      },
    });
  };

  const columns: ColumnsType<CertificateRequest> = [
    {
      title: 'Aluno',
      dataIndex: ['student', 'fullName'],
      key: 'aluno',
    },
    {
      title: 'Curso',
      dataIndex: ['course', 'name'],
      key: 'curso',
    },
    {
      title: 'Data da Solicitação',
      dataIndex: 'createdAt',
      key: 'data',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Status',
      dataIndex: 'statusDescription',
      key: 'status',
      render: (status: string, record: CertificateRequest) => (
        <Tag color={
            record.status === 'aprovado' ? 'green' : 
            record.status === 'reprovado' ? 'red' : 'gold'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_: unknown, record: CertificateRequest) => (
        <Space size="middle">
          {record.status === 'analise' && (
            <>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApprove(record)}>
                Aprovar
              </Button>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => handleReject(record)}>
                Reprovar
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Title level={2} className={styles.pageTitle}>Solicitações de Certificados</Title>

      <Radio.Group
        options={[
          { label: 'Em Análise', value: 'analise' },
          { label: 'Aprovadas', value: 'aprovado' },
          { label: 'Reprovadas', value: 'reprovado' },
        ]}
        onChange={(e) => setFilterStatus(e.target.value)}
        value={filterStatus}
        optionType="button"
        buttonStyle="solid"
        className={styles.filterGroup}
      />
      
      <Table
        columns={columns}
        dataSource={requests}
        loading={loading}
        rowKey="id"
        locale={{ emptyText: <Empty description="Nenhuma solicitação encontrada para este status." /> }}
      />
    </div>
  );
}