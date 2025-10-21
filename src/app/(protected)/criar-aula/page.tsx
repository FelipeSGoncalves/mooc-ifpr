"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Typography,
  message,
  Space,
  Breadcrumb,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./CriarAula.module.css";

const { Title } = Typography;

const API_BASE_URL = "http://localhost:8080/mooc";

export default function CriarAulaPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  const courseId = searchParams.get('courseId');

  useEffect(() => {
    if (!courseId) {
      message.error("ID do curso não encontrado. Selecione um curso primeiro.");
      router.push("/cursos");
    }
  }, [courseId, router]);

  const onFinish = async (values: any) => {
    setLoading(true);

    // CORREÇÃO: Os nomes das chaves foram "traduzidos" para o padrão em português 
    // que o backend parece estar a esperar, apesar do que está no DTO.
    const lessonData = {
      titulo: values.titulo,
      descricao: values.descricao,
      urlVideo: values.urlVideo,
    };

    const token = localStorage.getItem("jwt_token");
    if (!token) {
      message.error("Você não está autenticado.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(lessonData),
      });

      if (response.ok) {
        message.success("Aula criada com sucesso!");
        router.push(`/cursos/${courseId}`);
      } else {
        const errorData = await response.json();
        const detailedMessage = errorData.errors ? Object.values(errorData.errors)[0] : (errorData.message || "Falha ao criar a aula.");
        throw new Error(detailedMessage as string);
      }
    } catch (error: any) {
      console.error("Erro:", error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
       <Breadcrumb
          className={styles.breadcrumb}
          items={[
            { title: <Link href="/cursos">Catálogo de Cursos</Link> },
            { title: <Link href={`/cursos/${courseId}`}>Detalhes do Curso</Link> },
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
    </div>
  );
}