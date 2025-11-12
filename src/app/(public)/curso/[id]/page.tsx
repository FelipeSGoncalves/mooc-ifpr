"use client";

import { useState, useEffect } from "react";
import {
  Typography, Button, Row, Col, List, Spin, Empty, App, Space, Breadcrumb
} from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
// Usaremos o CSS da página do aluno para manter o estilo consistente
import styles from "../../../(protected)/aluno/cursos/[id]/page.module.css"; 

import { getCourseDetails, CourseDetails, LessonSummary } from "@/services/courseService";
import fallbackImage from "@/assets/mooc.jpeg";

const { Title, Paragraph, Text } = Typography;

export default function PublicCoursePage() {
  const { message } = App.useApp();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await getCourseDetails(id);
        // Garante que o curso só seja exibido se estiver marcado como visível no backend
        if (!data.visivel) {
          throw new Error("Curso não disponível");
        }
        // Ordena as aulas antes de exibir
        if (data.aulas) {
          data.aulas.sort((a, b) => a.ordemAula - b.ordemAula);
        }
        setCourse(data);
      } catch (error) {
        message.error("Curso não encontrado ou indisponível.");
        router.push("/catalogo"); // Redireciona para o catálogo se o curso não for público
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, router, message]);

  if (loading) {
    return <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Spin size="large" /></div>;
  }

  if (!course) {
    return <div className={styles.container}><Empty description="Curso não encontrado." /></div>;
  }

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { title: <Link href="/catalogo">Catálogo de Cursos</Link> },
          { title: course.nome },
        ]}
      />
      <Row gutter={[48, 32]}>
          {/* Coluna da Esquerda: Detalhes do Curso */}
          <Col xs={24} lg={16}>
            <Title level={2} style={{ marginBottom: 16 }}>{course.nome}</Title>
            <Paragraph>{course.descricao}</Paragraph>
            <Text strong>Professor:</Text> <Text>{course.nomeProfessor}</Text><br/>
            <Text strong>Carga Horária:</Text> <Text>{course.cargaHoraria} horas</Text><br/>
            <Text strong>Área:</Text> <Text>{course.areaConhecimento.nome}</Text>
          </Col>

          {/* Coluna da Direita: Imagem e Botões de Ação */}
          <Col xs={24} lg={8}>
            <Image
              src={course.miniatura || fallbackImage}
              alt={`Miniatura do curso ${course.nome}`}
              width={350}
              height={200}
              style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '12px' }}
              priority
            />
            <div className={styles.actionButtonContainer}>
              <Space direction="vertical" style={{ width: '100%' }}>
                  <Link href={`/auth/login?redirect=/aluno/cursos/${id}`} style={{ width: '100%' }}>
                    <Button type="primary" size="large" block>
                        Entrar para se Inscrever
                    </Button>
                  </Link>
                  <Link href="/auth/cadastro" style={{ width: '100%' }}>
                    <Button size="large" block>
                        Ainda não tenho cadastro
                    </Button>
                  </Link>
              </Space>
            </div>
          </Col>
        </Row>
        
        {/* Seção da Lista de Aulas */}
        <div className={styles.lessonsSection}>
          <Title level={3}>Conteúdo do Curso</Title>
          <List
            bordered
            dataSource={course.aulas}
            renderItem={(aula: LessonSummary) => (
              <List.Item
                // Ícone de cadeado para indicar que precisa de login
                extra={<LockOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />}
              >
                <List.Item.Meta
                  title={<Text disabled>{aula.ordemAula}. {aula.titulo}</Text>}
                />
              </List.Item>
            )}
            locale={{ emptyText: "As aulas deste curso serão disponibilizadas em breve." }}
          />
        </div>
    </div>
  );
}