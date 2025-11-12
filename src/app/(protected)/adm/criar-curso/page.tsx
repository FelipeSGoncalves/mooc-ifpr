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

import { getKnowledgeAreas, KnowledgeArea, uploadCourseThumbnail } from "@/services/courseService";
// 1. Importar a função para buscar os campi
import { getCampuses, ConfigItem } from "@/services/configurationService";
import { apiRequest, ApiError } from "@/services/api";

const { Title } = Typography;
const { Dragger } = Upload;

interface CreateCourseFormValues {
  titulo: string;
  descricao: string;
  cargaHoraria: number;
  nomeProfessor: string;
  areaConhecimento: number;
  campus: number;
}

export default function CriarCursoPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { message } = App.useApp();
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [campuses, setCampuses] = useState<ConfigItem[]>([]); // 2. Estado para os campi
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Busca Áreas de Conhecimento
    getKnowledgeAreas()
      .then(data => setKnowledgeAreas(data.conteudo || []))
      .catch(() => message.error("Não foi possível carregar as áreas de conhecimento."));

    // 3. Busca os Campi
    getCampuses()
      .then(data => setCampuses(data.conteudo || []))
      .catch(() => message.error("Não foi possível carregar a lista de campi."));
  }, [message]);

  const onFinish = async (values: CreateCourseFormValues) => {
    setLoading(true);

    const courseData = {
      nome: values.titulo,
      descricao: values.descricao,
      cargaHoraria: values.cargaHoraria,
      nomeProfessor: values.nomeProfessor,
      areaConhecimentoId: values.areaConhecimento,
      campusId: values.campus,
    };
    
    // ... (resto da função onFinish permanece igual)
    const token = parseCookies().jwt_token;
    if (!token) { message.error("Autenticação expirou."); setLoading(false); return; }
    try {
      const newCourse = await apiRequest<{ id: number }>("/courses", { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(courseData), });
      if (fileList.length > 0) {
        message.loading({ content: 'Curso criado, enviando imagem...', key: 'upload' });
        const imageFile = fileList[0] as RcFile;
        await uploadCourseThumbnail(newCourse.id, imageFile);
      }
      message.success({ content: 'Curso salvo com sucesso!', key: 'upload' });
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
        <Link href="/adm/cursos" passHref><Button icon={<ArrowLeftOutlined />}>Voltar</Button></Link>
        <Title level={2} className={styles.title}>Criar Novo Curso</Title>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* ... (campos de título, carga horária, descrição) ... */}
        <Row gutter={24}><Col xs={24} md={18}><Form.Item name="titulo" label="Título do Curso" rules={[{ required: true, message: "Insira o título!" }]}><Input placeholder="Ex: Introdução ao React" size="large" /></Form.Item></Col><Col xs={24} md={6}><Form.Item name="cargaHoraria" label="Carga Horária (horas)" rules={[{ required: true, message: "Insira a carga horária!" }]}><InputNumber style={{ width: "100%" }} placeholder="Ex: 40" size="large" /></Form.Item></Col></Row>
        <Form.Item name="descricao" label="Descrição" rules={[{ required: true, message: "Insira a descrição!" }]}><Input.TextArea rows={4} placeholder="Descreva os objetivos e o conteúdo do curso."/></Form.Item>

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
        
        {/* --- 5. CAMPO DE CAMPUS ADICIONADO --- */}
        <Form.Item name="campus" label="Campus de Origem" rules={[{ required: true, message: "Selecione o campus!" }]}>
            <Select placeholder="Selecione um campus" options={campuses.map(campus => ({ value: campus.id, label: campus.name }))} size="large" />
        </Form.Item>
        
        {/* ... (campo de thumbnail e botões) ... */}
        <Form.Item name="thumbnail" label="Thumbnail do Curso (Opcional)"><Dragger fileList={fileList} beforeUpload={(file) => { setFileList([file]); return false; }} onRemove={() => setFileList([])} maxCount={1}><p className="ant-upload-drag-icon"><UploadOutlined /></p><p className="ant-upload-text">Clique ou arraste a imagem</p></Dragger></Form.Item>
        <Form.Item><Space><Button type="primary" htmlType="submit" size="large" loading={loading}>Salvar Curso</Button><Button size="large" onClick={() => router.back()}>Cancelar</Button></Space></Form.Item>
      </Form>
    </div>
  );
}