"use client";

import { useState, useEffect } from "react";
import {
  Typography, Button, Row, Col, List, Spin, Empty, App, Space, Progress, Breadcrumb
} from "antd";
import { PlayCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css"; // Vamos criar este CSS

import { getCourseDetails, CourseDetails } from "@/services/courseService";
import { enrollInCourse } from "@/services/enrollmentService";
import fallbackImage from "@/assets/mooc.jpeg";
import { useAuth } from "@/hooks/useAuth";

const { Title, Paragraph, Text } = Typography;

export default function AlunoCursoPage() {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const fetchCourseDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getCourseDetails(id);
      if (data.aulas) {
        data.aulas.sort((a, b) => a.ordemAula - b.ordemAula);
      }
      setCourse(data);
    } catch (error) {
      message.error("Não foi possível carregar os detalhes do curso.");
      router.push("/aluno/catalogo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);
  
  const handleEnroll = async () => {
    if (!user || !course) return;

    try {
      await enrollInCourse(course.id);
      message.success("Inscrição realizada com sucesso!");
      fetchCourseDetails();
    } catch (error) {
      message.error("Falha ao se inscrever. Você já pode estar matriculado.");
    }
  };
  
  const renderActionButtons = () => {
    const isEnrolled = course?.inscricaoInfo?.estaInscrito;

    if (isEnrolled) {
      return (
        <Space>
          <Button type="primary" size="large" icon={<PlayCircleOutlined />}>
            Continuar Assistindo
          </Button>
          <Button size="large" danger disabled>
            Cancelar Inscrição
          </Button>
        </Space>
      );
    }

    return (
      <Button type="primary" size="large" onClick={handleEnroll}>
        Inscrever-se Gratuitamente
      </Button>
    );
  };

  if (loading) {
    return <div className={styles.container}><Spin size="large" /></div>;
  }

  if (!course) {
    return <div className={styles.container}><Empty description="Curso não encontrado." /></div>;
  }

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          // CORREÇÃO: Alterado de '/aluno/catalogo' para '/aluno/cursos'
          { title: <Link href="/aluno/cursos">Catálogo de Cursos</Link> },
          { title: course.nome },
        ]}
      />
      {/* ... O resto do JSX é igual ao que fizemos antes ... */}
      <Row gutter={[48, 32]}>
          <Col xs={24} lg={16}>
            <Title level={2} style={{ marginBottom: 16 }}>{course.nome}</Title>
            <Paragraph>{course.descricao}</Paragraph>
            <Text strong>Professor:</Text> <Text>{course.nomeProfessor}</Text><br/>
            <Text strong>Carga Horária:</Text> <Text>{course.cargaHoraria} horas</Text><br/>
            <Text strong>Área:</Text> <Text>{course.areaConhecimento.nome}</Text>
            
            {course.inscricaoInfo?.estaInscrito && course.inscricaoInfo.totalAulas > 0 && (
              <div className={styles.progressSection}>
                <Title level={4}>Seu Progresso</Title>
                <Progress percent={Math.round((course.inscricaoInfo.aulasConcluidas / course.inscricaoInfo.totalAulas) * 100)} />
                <Text>{course.inscricaoInfo.aulasConcluidas} de {course.inscricaoInfo.totalAulas} aulas concluídas.</Text>
              </div>
            )}
          </Col>

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
              {renderActionButtons()}
            </div>
          </Col>
        </Row>
        <div className={styles.lessonsSection}>
          <Title level={3}>Conteúdo do Curso</Title>
          <List
            bordered
            dataSource={course.aulas}
            renderItem={(aula: any) => (
              <List.Item
                extra={course.inscricaoInfo?.estaInscrito && aula.concluido ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : null}
              >
                <List.Item.Meta
                  title={
                    course.inscricaoInfo?.estaInscrito ? (
                      <Link href={`/aluno/cursos/${id}/aula/${aula.id}`}>{aula.titulo}</Link>
                    ) : (
                      <Text>{aula.titulo}</Text>
                    )
                  }
                />
              </List.Item>
            )}
            locale={{ emptyText: "As aulas deste curso serão disponibilizadas em breve." }}
          />
        </div>
    </div>
  );
}