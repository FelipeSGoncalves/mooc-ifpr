"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Typography,
  Upload,
  message,
  Row,
  Col,
  Space,
} from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./CriarCurso.module.css";
import type { UploadFile } from "antd/es/upload/interface";

const { Title } = Typography;
const { Dragger } = Upload;

interface KnowledgeArea {
  id: number;
  name: string;
}

const API_BASE_URL = "http://localhost:8080/mooc";

export default function CriarCursoPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchKnowledgeAreas = async () => {
      try {
        const areasRes = await fetch(`${API_BASE_URL}/knowledge-area`);
        const areasData = await areasRes.json();
        setKnowledgeAreas(areasData.conteudo || []);
      } catch (error) {
        console.error("Falha ao buscar áreas de conhecimento:", error);
        message.error("Não foi possível carregar as opções de área.");
      }
    };
    fetchKnowledgeAreas();
  }, []);


  const onFinish = async (values: any) => {
    setLoading(true);

    // CORREÇÃO: Os nomes das chaves foram "traduzidos" para corresponder ao que o backend espera.
    const courseData = {
      nome: values.titulo,
      descricao: values.descricao,
      cargaHoraria: values.cargaHoraria,
      nomeProfessor: values.nomeProfessor,
      miniatura: null, // 'thumbnail' foi corrigido para 'miniatura'
      areaConhecimentoId: values.areaConhecimento,
      campusId: 1,
      visivel: values.visivel,
    };
    
    const token = localStorage.getItem("jwt_token");
    if (!token) {
        message.error("Você não está autenticado. Faça o login para criar um curso.");
        setLoading(false);
        router.push("/auth/login");
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        message.success("Curso criado com sucesso!");
        router.push('/cursos');
      } else {
        const errorData = await response.json();
        console.error("Erro do backend:", errorData);
        // A mensagem de erro agora mostrará os detalhes da validação
        const firstError = errorData.errors ? Object.values(errorData.errors)[0] : "Verifique os dados.";
        message.error(`Falha ao criar o curso: ${firstError}`);
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      message.error("Não foi possível conectar ao servidor.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/dashboard" passHref>
          <Button icon={<ArrowLeftOutlined />}>Voltar</Button>
        </Link>
        <Title level={2} className={styles.title}>
          Criar Curso
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ visivel: true }}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item name="titulo" label="Título do Curso" rules={[{ required: true, message: "Insira o título!" }]}>
              <Input placeholder="Ex: Introdução ao React" />
            </Form.Item>
          </Col>
          <Col xs={12} md={6}>
            <Form.Item name="visivel" label="Curso visível?">
              <Radio.Group>
                <Radio.Button value={true}>Sim</Radio.Button>
                <Radio.Button value={false}>Não</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={12} md={6}>
            <Form.Item name="cargaHoraria" label="Carga Horária (horas)" rules={[{ required: true, message: "Insira a carga horária!" }]}>
              <InputNumber style={{ width: "100%" }} placeholder="Ex: 40" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="descricao" label="Descrição" rules={[{ required: true, message: "Insira a descrição!" }]}>
          <Input.TextArea rows={4} placeholder="Descreva os objetivos e o conteúdo do curso."/>
        </Form.Item>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item name="nomeProfessor" label="Nome do Professor" rules={[{ required: true, message: "Insira o nome do professor!" }]}>
              <Input placeholder="Ex: Prof. Dr. João da Silva" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="areaConhecimento" label="Área do Curso" rules={[{ required: true, message: "Selecione a área!" }]}>
              <Select placeholder="Selecione uma área" options={knowledgeAreas.map(area => ({ value: area.id, label: area.name }))} />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="thumbnail" label="Thumbnail (Opcional)">
            <Dragger 
            name="file"
            listType="picture"
            action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
            fileList={fileList}
            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
            maxCount={1}
            >
            <p className="ant-upload-drag-icon"><UploadOutlined /></p>
            <p className="ant-upload-text">Clique ou arraste um arquivo para esta área</p>
            </Dragger>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" size="large" loading={loading}>
              Criar
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