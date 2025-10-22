"use client";

import { useState, useEffect } from "react";
import {
  Button, Form, Input, InputNumber, Select, Typography, Upload, App, Row, Col, Space, Spin, Breadcrumb
} from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import styles from "../../../criar-curso/CriarCurso.module.css";
import type { RcFile, UploadFile } from "antd/es/upload/interface";

import { getKnowledgeAreas, KnowledgeArea, getCourseDetails, updateCourse, uploadCourseThumbnail } from "@/services/courseService";
import { ApiError } from "@/services/api";

const { Title } = Typography;
const { Dragger } = Upload;
const { Option } = Select; // Importar Option

export default function EditarCursoPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(null);

  const id = params.id as string;

  useEffect(() => {
    if (!id) return;

    const fetchCourseData = async () => {
      try {
        const course = await getCourseDetails(id);
        form.setFieldsValue({
          titulo: course.nome,
          descricao: course.descricao,
          cargaHoraria: course.cargaHoraria,
          nomeProfessor: course.nomeProfessor,
          areaConhecimento: course.areaConhecimento.id,
          visivel: course.visivel, // Preenche o campo de visibilidade
        });
        setCurrentThumbnailUrl(course.miniatura);
      } catch (error) {
        message.error("Falha ao carregar dados do curso para edição.");
        router.push("/adm/cursos");
      } finally {
        setPageLoading(false);
      }
    };

    fetchCourseData();
  }, [id, form, message, router]);

  useEffect(() => {
    getKnowledgeAreas()
      .then(data => setKnowledgeAreas(data.conteudo || []))
      .catch(() => message.error("Não foi possível carregar as áreas de conhecimento."));
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
      visivel: values.visivel, // Agora 'visivel' sempre terá um valor
    };

    try {
      await updateCourse(id, courseData);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        message.loading({ content: 'Dados atualizados, enviando nova imagem...', key: 'upload' });
        const imageFile = fileList[0].originFileObj as RcFile;
        await uploadCourseThumbnail(Number(id), imageFile);
      }

      message.success({ content: 'Curso atualizado com sucesso!', key: 'upload' });
      router.push(`/adm/cursos/${id}`);

    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Ocorreu um erro desconhecido.";
      message.error({ content: `Falha ao atualizar curso: ${errorMessage}`, key: 'upload' });
    } finally {
        setLoading(false);
    }
  };

  if (pageLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>;
  }

  return (
    <div className={styles.container}>
      <Breadcrumb style={{ marginBottom: 24 }}
        items={[
          { title: <Link href="/adm/cursos">Cursos</Link> },
          { title: <Link href={`/adm/cursos/${id}`}>Detalhes do Curso</Link> },
          { title: 'Editar' },
        ]}
      />

      <Title level={2} className={styles.title}>
        Editar Curso
      </Title>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* ...campos de título, carga horária, etc... */}
        <Row gutter={24}>
          <Col xs={24} md={18}>
            <Form.Item name="titulo" label="Título do Curso" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="cargaHoraria" label="Carga Horária (horas)" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} size="large" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="descricao" label="Descrição" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item name="nomeProfessor" label="Nome do Professor" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="areaConhecimento" label="Área do Curso" rules={[{ required: true }]}>
              <Select options={knowledgeAreas.map(area => ({ value: area.id, label: area.name }))} size="large" />
            </Form.Item>
          </Col>
        </Row>
        
        {/* CAMPO DE VISIBILIDADE ADICIONADO AQUI */}
        <Form.Item name="visivel" label="Visibilidade do Curso" rules={[{ required: true, message: 'Selecione a visibilidade' }]}>
            <Select placeholder="Selecione" size="large">
                <Option value={true}>Público (Visível para alunos)</Option>
                <Option value={false}>Privado (Não visível para alunos)</Option>
            </Select>
        </Form.Item>
        
        <Form.Item label="Thumbnail do Curso (Opcional)">
          {currentThumbnailUrl && fileList.length === 0 && (
            <div style={{ marginBottom: 16 }}>
              <p>Imagem atual:</p>
              <Image src={currentThumbnailUrl} alt="Thumbnail atual" width={150} height={90} style={{ objectFit: 'cover', borderRadius: 8 }} />
            </div>
          )}
          <Dragger 
            fileList={fileList}
            beforeUpload={(file) => { setFileList([file]); return false; }}
            onRemove={() => setFileList([])}
            maxCount={1}
          >
            <p className="ant-upload-drag-icon"><UploadOutlined /></p>
            <p className="ant-upload-text">Clique ou arraste uma nova imagem para substituir</p>
          </Dragger>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" size="large" loading={loading}>
              Salvar Alterações
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