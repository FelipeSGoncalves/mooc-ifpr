"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Button,
  Form,
  Input,
  Typography,
  Space,
  Breadcrumb,
  App,
  Spin,
} from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./CriarAula.module.css";
import { parseCookies } from "nookies";
import { apiRequest, ApiError } from "@/services/api";

const { Title } = Typography;

interface LessonFormValues {
  titulo: string;
  descricao: string;
  urlVideo: string;
}

// Component that uses the hook
function CreateLessonForm() {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);
  const courseId = searchParams.get('courseId');

  useEffect(() => {
    if (!courseId) {
      message.error("ID do curso não encontrado. Selecione um curso primeiro.");
      router.push("/adm/cursos");
    }
  }, [courseId, router, message]);

  const onFinish = async (values: LessonFormValues) => {
    setLoading(true);

    const lessonData = {
      titulo: values.titulo,
      descricao: values.descricao,
      urlVideo: values.urlVideo,
    };

    const token = parseCookies().jwt_token;
    if (!token) {
      message.error("Você não está autenticado.");
      setLoading(false);
      return;
    }

    try {
      await apiRequest(`/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(lessonData),
      });

      message.success("Aula criada com sucesso!");
      router.push(`/adm/cursos/${courseId}`);

    } catch (error) {
      console.error("Erro ao criar aula:", error);
      const errorMessage = error instanceof ApiError ? error.message : "Ocorreu um erro desconhecido.";
      message.error(`Falha ao criar aula: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!courseId) {
    return <Spin />;
  }

  return (
    <>
      <Breadcrumb
        className={styles.breadcrumb}
        items={[
          { title: <Link href="/adm/cursos">Catálogo de Cursos</Link> },
          { title: <Link href={`/adm/cursos/${courseId}`}>Detalhes do Curso</Link> },
          { title: 'Criar Aula' },
        ]}
      />
      
      <Title level={2} className={styles.title}>
        Adicionar Nova Aula
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item name="titulo" label="Título da Aula" rules={[{ required: true, message: "Por favor, insira o título!" }]}>
          <Input placeholder="Ex: Introdução ao Spring Boot" size="large" />
        </Form.Item>

        <Form.Item name="descricao" label="Descrição da Aula" rules={[{ required: true, message: "Por favor, insira a descrição!" }]}>
          <Input.TextArea rows={4} placeholder="O que será abordado nesta aula?" />
        </Form.Item>

        <Form.Item name="urlVideo" label="URL do Vídeo (YouTube)" rules={[{ required: true, message: "Por favor, insira a URL do vídeo!" }, { type: 'url', message: 'Por favor, insira uma URL válida!' }]}>
          <Input placeholder="https://www.youtube.com/watch?v=..." size="large" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" size="large" loading={loading}>
              Criar Aula
            </Button>
            <Button size="large" onClick={() => router.back()}>
              Cancelar
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </>
  );
}

// Main page component
export default function CriarAulaPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<Spin size="large" />}>
        <CreateLessonForm />
      </Suspense>
    </div>
  );
}