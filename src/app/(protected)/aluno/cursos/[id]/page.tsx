"use client";

import { useState, useEffect } from "react";
import {
  Typography, Button, Row, Col, List, Spin, Empty, App, Space, Progress, Breadcrumb, Tooltip
} from "antd";
import { PlayCircleOutlined, CheckCircleOutlined, DownloadOutlined, HourglassOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

import { getCourseDetails, CourseDetails, LessonSummary } from "@/services/courseService";
import { enrollInCourse } from "@/services/enrollmentService";
import { generateCertificate } from "@/services/certificateService";
import fallbackImage from "@/assets/mooc.jpeg";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";

const { Title, Paragraph, Text } = Typography;

export default function AlunoCursoPage() {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
      router.push("/aluno/cursos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id, message, router]);

  const handleEnroll = async () => {
    if (!user || !course) return;
    setActionLoading(true);
    try {
      await enrollInCourse(course.id);
      message.success("Inscrição realizada com sucesso!");
      fetchCourseDetails();
    } catch (error) {
      message.error("Falha ao se inscrever. Você já pode estar matriculado.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!course?.inscricaoInfo) return;
    setActionLoading(true);
    try {
      await generateCertificate(course.inscricaoInfo.inscricaoId);
      message.success("Download do certificado iniciado!");
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Ocorreu um erro desconhecido.";
      message.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const renderActionButtons = () => {
    // Se não estiver inscrito
    if (!course || !course.inscricaoInfo?.estaInscrito) {
      return (
        <Button type="primary" size="large" onClick={handleEnroll} loading={actionLoading}>
          Inscrever-se Gratuitamente
        </Button>
      );
    }

    // Se o curso foi concluído
    if (course.inscricaoInfo.concluido) {
      const status = course.inscricaoInfo.certificateStatus;

      if (status === 'aprovado') {
        return (
          <Button type="primary" size="large" icon={<DownloadOutlined />} onClick={handleGenerateCertificate} loading={actionLoading}>
            Baixar Certificado
          </Button>
        );
      }
      
      if (status === 'reprovado') {
        return (
          <Tooltip title="Sua solicitação foi reprovada pela administração. Entre em contato para mais detalhes.">
            <Button type="primary" size="large" icon={<CloseCircleOutlined />} disabled danger>
              Solicitação Rejeitada
            </Button>
          </Tooltip>
        );
      }

      return (
        <Tooltip title="Caso seu certificado tenha sido aprovado ele estará disponível na aba de certificados">
          <Button type="primary" size="large" icon={<HourglassOutlined />} disabled>
            Concluido
          </Button>
        </Tooltip>
      );
    }

    // Se está inscrito, mas não concluiu
    const firstUnwatchedLesson = course.aulas.find(aula => !aula.concluido);
    const continueLink = firstUnwatchedLesson
      ? `/aluno/cursos/${id}/aula/${firstUnwatchedLesson.id}`
      : (course.aulas.length > 0 ? `/aluno/cursos/${id}/aula/${course.aulas[0].id}` : '#');

    return (
      <Space>
        <Link href={continueLink}>
          <Button type="primary" size="large" icon={<PlayCircleOutlined />}>
            Continuar Assistindo
          </Button>
        </Link>
        <Button size="large" danger disabled title="Função a ser implementada">
          Cancelar Inscrição
        </Button>
      </Space>
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
          { title: <Link href="/aluno/cursos">Catálogo de Cursos</Link> },
          { title: course.nome },
        ]}
      />
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
            renderItem={(aula: LessonSummary) => (
              <List.Item
                key={aula.id}
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