"use client";

import { useState, useEffect } from "react";
import {
  Button, Form, Input, InputNumber, Select, Typography, Upload, App, Row, Col, Space
} from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./CriarCurso.module.css";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import { parseCookies } from "nookies";

// Importando os serviços atualizados
import { getKnowledgeAreas, KnowledgeArea, uploadCourseThumbnail } from "@/services/courseService";
import { apiRequest, ApiError } from "@/services/api";

const { Title } = Typography;
const { Dragger } = Upload;

export default function CriarCursoPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { message } = App.useApp();
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchKnowledgeAreas = async () => {
      try {
        const data = await getKnowledgeAreas();
        setKnowledgeAreas(data.conteudo || []);
      } catch (error) {
        message.error("Não foi possível carregar as áreas de conhecimento.");
      }
    };
    fetchKnowledgeAreas();
  }, [message]);

  const onFinish = async (values: any) => {
    setLoading(true);

    const courseData = {
      nome: values.titulo,
      descricao: values.descricao,
      cargaHoraria: values.cargaHoraria,
      nomeProfessor: values.nomeProfessor,
      areaConhecimentoId: values.areaConhecimento,
      campusId: 1,
    };
    
    const token = parseCookies().jwt_token;
    if (!token) {
      message.error("Autenticação expirou. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      // --- ETAPA 1: Criar o curso com os dados de texto ---
      const newCourse = await apiRequest<{ id: number }>("/courses", {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(courseData),
      });

      // --- ETAPA 2: Se houver uma imagem, fazer o upload dela ---
      if (fileList.length > 0 && fileList[0].originFileObj) {
        message.loading({ content: 'Curso criado, enviando imagem...', key: 'upload' });
        const imageFile = fileList[0].originFileObj as RcFile;
        await uploadCourseThumbnail(newCourse.id, imageFile);
      }

      message.success({ content: 'Curso salvo com sucesso!', key: 'upload' });
      // Redireciona para a página de detalhes do curso recém-criado
      router.push(`/adm/cursos/${newCourse.id}`);

    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Ocorreu um erro desconhecido.";
      message.error({ content: `Falha ao criar curso: ${errorMessage}`, key: 'upload' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/adm/cursos" passHref>
          <Button icon={<ArrowLeftOutlined />}>Voltar</Button>
        </Link>
        <Title level={2} className={styles.title}>
          Criar Novo Curso
        </Title>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={24}>
          <Col xs={24} md={18}>
            <Form.Item name="titulo" label="Título do Curso" rules={[{ required: true, message: "Insira o título!" }]}>
              <Input placeholder="Ex: Introdução ao React" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="cargaHoraria" label="Carga Horária (horas)" rules={[{ required: true, message: "Insira a carga horária!" }]}>
              <InputNumber style={{ width: "100%" }} placeholder="Ex: 40" size="large" />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="descricao" label="Descrição" rules={[{ required: true, message: "Insira a descrição!" }]}>
          <Input.TextArea rows={4} placeholder="Descreva os objetivos e o conteúdo do curso."/>
        </Form.Item>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item name="nomeProfessor" label="Nome do Professor" rules={[{ required: true, message: "Insira o nome do professor!" }]}>
              <Input placeholder="Ex: Prof. Dr. João da Silva" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="areaConhecimento" label="Área do Curso" rules={[{ required: true, message: "Selecione a área!" }]}>
              <Select placeholder="Selecione uma área" options={knowledgeAreas.map(area => ({ value: area.id, label: area.name }))} size="large" />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="thumbnail" label="Thumbnail do Curso (Opcional)">
            <Dragger 
              fileList={fileList}
              beforeUpload={(file) => {
                setFileList([file]); // Apenas armazena o arquivo no estado
                return false; // Impede o upload automático do Ant Design
              }}
              onRemove={() => setFileList([])}
              maxCount={1}
            >
              <p className="ant-upload-drag-icon"><UploadOutlined /></p>
              <p className="ant-upload-text">Clique ou arraste a imagem para esta área</p>
              <p className="ant-upload-hint">A imagem será enviada após a criação do curso.</p>
            </Dragger>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" size="large" loading={loading}>
              Salvar Curso
            </Button>
            <Button size="large" onClick={() => router.back()}>
              Cancelar
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}