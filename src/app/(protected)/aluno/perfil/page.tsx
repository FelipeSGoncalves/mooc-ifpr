"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Typography,
  Spin,
  Empty,
  App,
  Descriptions,
  Card,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
} from "antd";
import { EditOutlined, UserOutlined, MailOutlined, IdcardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./PerfilPage.module.css";

import { getCurrentUserDetails, updateCurrentUser, UserDetails } from "@/services/userService";
import { ApiError } from "@/services/api";

const { Title } = Typography;

export default function PerfilPage() {
  const { message } = App.useApp();
  
  // Estados para dados e carregamento
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para o Modal de Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // Busca os dados ao carregar a página
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCurrentUserDetails();
      setUser(data);
    } catch (error) {
      console.error(error);
      message.error("Não foi possível carregar os dados do seu perfil.");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Formatação visual do CPF
  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Abre o modal e preenche o formulário com os dados atuais
  const handleEditClick = () => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        cpf: user.cpf, // O backend aceita com ou sem máscara, mas vamos manter simples
        birthDate: dayjs(user.birthDate),
      });
      setIsModalOpen(true);
    }
  };

  // Envia os dados atualizados para o backend
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        fullName: values.fullName,
        email: values.email,
        cpf: values.cpf.replace(/\D/g, ""), // Remove formatação do CPF antes de enviar
        birthDate: values.birthDate.format("YYYY-MM-DD"),
      };

      const updatedUser = await updateCurrentUser(payload);
      
      setUser(updatedUser); // Atualiza os dados na tela
      message.success("Perfil atualizado com sucesso!");
      setIsModalOpen(false);
      
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : "Erro ao atualizar perfil. Verifique os dados.";
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
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
      
      <Card className={styles.profileCard}>
        <Descriptions
          title="Dados Pessoais"
          bordered
          column={{ xs: 1, sm: 1, md: 2 }}
          extra={
            <Button type="primary" icon={<EditOutlined />} onClick={handleEditClick}>
              Editar Perfil
            </Button>
          }
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
          <Descriptions.Item label="Status">
            {user.active ? "Ativo" : "Inativo"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Modal de Edição */}
      <Modal
        title="Editar Dados Pessoais"
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={saving}
        okText="Salvar Alterações"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" name="edit_profile_form">
          <Form.Item
            name="fullName"
            label="Nome Completo"
            rules={[{ required: true, message: 'Por favor, insira seu nome.' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Seu nome completo" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor, insira seu email.' },
              { type: 'email', message: 'Insira um email válido.' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="seu@email.com" />
          </Form.Item>

          <Form.Item
            name="cpf"
            label="CPF"
            rules={[{ required: true, message: 'Por favor, insira seu CPF.' }]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="000.000.000-00" maxLength={14} />
          </Form.Item>

          <Form.Item
            name="birthDate"
            label="Data de Nascimento"
            rules={[{ required: true, message: 'Por favor, insira sua data de nascimento.' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Selecione a data" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}