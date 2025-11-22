"use client";

import { useState, useEffect } from "react";
import {
  Button, Form, Input, InputNumber, Select, Typography, Upload, App, Row, Col, Space, Spin, Breadcrumb
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import styles from "../../../criar-curso/CriarCurso.module.css";
import type { RcFile, UploadFile } from "antd/es/upload/interface";

import { getKnowledgeAreas, KnowledgeArea, getCourseDetails, updateCourse, uploadCourseThumbnail } from "@/services/courseService";
// 1. Importar a função para buscar os campi
import { getCampuses, ConfigItem } from "@/services/configurationService";
import { ApiError } from "@/services/api";

const { Title } = Typography;
const { Dragger } = Upload;
const { Option } = Select;


interface EditCourseFormValues {
  titulo: string;
  descricao: string;
  cargaHoraria: number;
  nomeProfessor: string;
  areaConhecimento: number;
  campusId: number;
  visivel: boolean;
}

export default function EditarCursoPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [campuses, setCampuses] = useState<ConfigItem[]>([]); // 2. Estado para os campi
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(null);

  const id = params.id as string;

  useEffect(() => {
    if (!id) return;

    // Busca dados do curso, áreas e campi em paralelo
    const fetchData = async () => {
      try {
        const [course, areasData, campusesData] = await Promise.all([
          getCourseDetails(id),
          getKnowledgeAreas(),
          getCampuses() // 3. Busca os campi
        ]);

        setKnowledgeAreas(areasData.conteudo || []);
        setCampuses(campusesData.conteudo || []); // 4. Armazena os campi

        form.setFieldsValue({
          titulo: course.nome,
          descricao: course.descricao,
          cargaHoraria: course.cargaHoraria,
          nomeProfessor: course.nomeProfessor,
          areaConhecimento: course.areaConhecimento.id,
          // 5. Preenche o campo de campus com o valor atual do curso
          campusId: course.campus.id, 
          visivel: course.visivel,
        });
        setCurrentThumbnailUrl(course.miniatura);
      } catch {
        message.error("Falha ao carregar dados para edição.");
        router.push("/adm/cursos");
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [id, form, message, router]);

  const onFinish = async (values: EditCourseFormValues) => {
    setLoading(true);
    const courseData = {
      nome: values.titulo,
      descricao: values.descricao,
      cargaHoraria: values.cargaHoraria,
      nomeProfessor: values.nomeProfessor,
      areaConhecimentoId: values.areaConhecimento,
      campusId: values.campusId, 
      visivel: values.visivel,
    };

    // ... (resto da função onFinish permanece igual)
    try {
      await updateCourse(id, courseData);
      if (fileList.length > 0) {
        message.loading({ content: 'Dados atualizados, enviando nova imagem...', key: 'upload' });
        const imageFile = fileList[0] as RcFile;
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
        items={[ { title: <Link href="/adm/cursos">Cursos</Link> }, { title: <Link href={`/adm/cursos/${id}`}>Detalhes</Link> }, { title: 'Editar' }, ]}
      />
      <Title level={2} className={styles.title}>Editar Curso</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* ... (campos de título, carga horária, descrição, professor, área) ... */}
        <Row gutter={24}><Col xs={24} md={18}><Form.Item name="titulo" label="Título do Curso" rules={[{ required: true }]}><Input size="large" /></Form.Item></Col><Col xs={24} md={6}><Form.Item name="cargaHoraria" label="Carga Horária (horas)" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} size="large" /></Form.Item></Col></Row>
        <Form.Item name="descricao" label="Descrição" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
        <Row gutter={24}><Col xs={24} md={12}><Form.Item name="nomeProfessor" label="Nome do Professor" rules={[{ required: true }]}><Input size="large" /></Form.Item></Col><Col xs={24} md={12}><Form.Item name="areaConhecimento" label="Área do Curso" rules={[{ required: true }]}><Select options={knowledgeAreas.map(area => ({ value: area.id, label: area.name }))} size="large" /></Form.Item></Col></Row>
        
        {/* --- 7. CAMPO DE CAMPUS ADICIONADO --- */}
        <Form.Item name="campusId" label="Campus de Origem" rules={[{ required: true, message: 'Selecione o campus!' }]}>
            <Select placeholder="Selecione um campus" options={campuses.map(campus => ({ value: campus.id, label: campus.name }))} size="large" />
        </Form.Item>
        
        <Form.Item name="visivel" label="Visibilidade" rules={[{ required: true }]}><Select size="large"><Option value={true}>Público</Option><Option value={false}>Privado</Option></Select></Form.Item>
        <Form.Item label="Thumbnail (Opcional)">
          {currentThumbnailUrl && fileList.length === 0 && ( <div style={{ marginBottom: 16 }}><p>Imagem atual:</p><Image src={currentThumbnailUrl} alt="Thumbnail atual" width={150} height={90} style={{ objectFit: 'cover', borderRadius: 8 }} /></div>)}
          <Dragger fileList={fileList} beforeUpload={(file) => { setFileList([file]); return false; }} onRemove={() => setFileList([])} maxCount={1}><p className="ant-upload-drag-icon"><UploadOutlined /></p><p className="ant-upload-text">Arraste uma nova imagem para substituir</p></Dragger>
        </Form.Item>
        <Form.Item><Space><Button type="primary" htmlType="submit" size="large" loading={loading}>Salvar Alterações</Button><Button size="large" onClick={() => router.back()}>Cancelar</Button></Space></Form.Item>
      </Form>
    </div>
  );
}