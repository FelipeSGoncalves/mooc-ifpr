"use client";

import { useState, useEffect } from "react";
import { Button, Form, Input, Typography, Space, Breadcrumb, App, Spin } from "antd";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import styles from "../../../../../criar-aula/CriarAula.module.css"; // Reutilizando o CSS da página de criar aula

import { getLessonDetails, updateLesson } from "@/services/lessonService";
import { ApiError } from "@/services/api";

const { Title } = Typography;

interface LessonFormValues {
  titulo: string;
  descricao: string;
  urlVideo: string;
}

export default function EditarAulaPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  const courseId = params.id as string;
  const lessonId = params.aulaId as string;

  useEffect(() => {
    if (!courseId || !lessonId) {
      message.error("IDs de curso ou aula inválidos.");
      router.push("/adm/cursos");
      return;
    }

    const fetchLessonData = async () => {
        setPageLoading(true);
        try {
            const lesson = await getLessonDetails(courseId, lessonId);
            form.setFieldsValue({
                titulo: lesson.titulo,
                descricao: lesson.descricao,
                urlVideo: lesson.urlVideo,
            });
        } catch {
            message.error("Não foi possível carregar os dados da aula.");
            router.push(`/adm/cursos/${courseId}`);
        } finally {
            setPageLoading(false);
        }
    };

    fetchLessonData();
  }, [courseId, lessonId, router, message, form]);

  const onFinish = async (values: LessonFormValues) => {
    setLoading(true);
    try {
      await updateLesson(courseId, lessonId, values);
      message.success("Aula atualizada com sucesso!");
      router.push(`/adm/cursos/${courseId}`);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Ocorreu um erro desconhecido.";
      message.error(`Falha ao atualizar aula: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>;
  }

  return (
    <div className={styles.container}>
      <Breadcrumb
        className={styles.breadcrumb}
        items={[
          { title: <Link href="/adm/cursos">Cursos</Link> },
          { title: <Link href={`/adm/cursos/${courseId}`}>Detalhes do Curso</Link> },
          { title: 'Editar Aula' },
        ]}
      />
      
      <Title level={2} className={styles.title}>
        Editar Aula
      </Title>

      <Form form={form} layout="vertical" onFinish={onFinish}>
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