"use client";

import { useState, useEffect } from "react";
import {
  Typography, Button, Row, Col, List, Spin, Empty, App, Space, Tag, Breadcrumb, Popconfirm
} from "antd";
import { 
  EditOutlined, PlusOutlined, EyeOutlined, EyeInvisibleOutlined, DeleteOutlined, MenuOutlined
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { deleteLesson } from "@/services/lessonService";
import styles from "./ApresentacaoCursoPage.module.css";
import { parseCookies } from 'nookies';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// IMPORT ATUALIZADO: Adicionado patchCourseVisibility
import { getCourseDetails, CourseDetails, LessonSummary, patchCourseVisibility } from "@/services/courseService";
import { apiRequest } from "@/services/api";
import fallbackImage from "@/assets/mooc.jpeg";

const { Title, Paragraph, Text } = Typography;

const SortableLesson = ({ lesson, courseId, onDelete }: { lesson: LessonSummary; courseId: string; onDelete: (id: number) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <List.Item ref={setNodeRef} style={style} className={styles.lessonItem}
            actions={[
                <Link key="edit" href={`/adm/cursos/${courseId}/aula/${lesson.id}/editar`} passHref>
                  <Button type="link" icon={<EditOutlined />} />
                </Link>,
                <Popconfirm
                    key="delete"
                    title="Excluir Aula"
                    description="Tem certeza de que deseja excluir esta aula?"
                    onConfirm={() => onDelete(lesson.id)}
                    okText="Sim"
                    cancelText="Não"
                >
                    <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
                <Button key="drag" type="text" {...attributes} {...listeners} icon={<MenuOutlined />} className={styles.dragHandle} />
            ]}
        >
            {/* ALTERAÇÃO 1: Adicionado lesson.ordemAula antes do título */}
            <List.Item.Meta title={<Text>{lesson.ordemAula}. {lesson.titulo}</Text>} />
        </List.Item>
    );
};

export default function ApresentacaoCursoPage() {
  const { message } = App.useApp();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    if (!id) return;
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        const data = await getCourseDetails(id);
        setCourse(data);
        setLessons(data.aulas ? [...data.aulas].sort((a, b) => a.ordemAula - b.ordemAula) : []);
      } catch (error) {
        message.error("Não foi possível carregar os detalhes do curso.");
        router.push("/adm/cursos");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id, router, message]);
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLessons((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, ordemAula: index + 1 }));
      });
      setHasChanges(true);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!course || !course.id) return;

    try {
      await deleteLesson(course.id, lessonId);
      message.success("Aula excluída com sucesso.");
      setLessons((prevLessons) => prevLessons.filter((lesson) => lesson.id !== lessonId));
    } catch (error) {
      console.error(error);
      message.error("Falha ao excluir a aula. Tente novamente.");
    }
  };
  
  const handleSaveChanges = async () => {
    const token = parseCookies().jwt_token;
    if (!token) {
        message.error("Autenticação necessária.");
        return;
    }
    
    const reorderPayload = {
        aulas: lessons.map(lesson => ({ id: lesson.id, ordemAula: lesson.ordemAula }))
    };

    try {
        await apiRequest(`/courses/${id}/lessons/reorder`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(reorderPayload)
        });
        message.success("Ordem das aulas salva com sucesso!");
        setHasChanges(false);
    } catch (error) {
        message.error("Não foi possível salvar as alterações.");
    }
  };

  // ALTERAÇÃO 2: Função otimizada usando patchCourseVisibility
  const handleToggleVisibility = async () => {
    if (!course) return;
    
    const newVisibility = !course.visivel;
    const action = newVisibility ? "publicado" : "privado";
    
    try {
        // Agora chamamos apenas o PATCH, sem precisar reenviar todos os dados do curso
        await patchCourseVisibility(course.id, newVisibility);

        setCourse({ ...course, visivel: newVisibility });
        message.success(`Curso tornado ${action} com sucesso!`);
    } catch (error) {
        message.error("Não foi possível alterar a visibilidade do curso.");
    }
  };

  if (loading) {
    return <div className={styles.spinContainer}><Spin size="large" /></div>;
  }

  if (!course) {
    return <Empty description="Curso não encontrado." />;
  }

  return (
    <div className={styles.container}>
      <Breadcrumb
        className={styles.breadcrumb}
        items={[
          { title: <Link href="/adm/cursos">Catálogo de Cursos</Link> },
          { title: course.nome },
        ]}
      />

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16} className={styles.detailsColumn}>
          <div className={styles.header}>
            <Title level={2} style={{ marginBottom: 0 }}>{course.nome}</Title>
            <Tag color={course.visivel ? "green" : "red"}>
              {course.visivel ? "Público" : "Privado"}
            </Tag>
          </div>
          <Paragraph className={styles.description}>{course.descricao}</Paragraph>
          <Text strong>Professor:</Text> <Text>{course.nomeProfessor}</Text><br/>
          <Text strong>Carga Horária:</Text> <Text>{course.cargaHoraria} horas</Text><br/>
          <Text strong>Área:</Text> <Text>{course.areaConhecimento.nome}</Text>
        </Col>

        <Col xs={24} lg={8}>
          <Image
            src={course.miniatura || fallbackImage}
            alt={`Thumbnail do curso ${course.nome}`}
            width={350}
            height={200}
            className={styles.thumbnail}
            priority
          />
          <Space className={styles.adminActions}>
            <Link href={`/adm/cursos/${course.id}/editar`}>
              <Button type="primary" icon={<EditOutlined />}>Editar Curso</Button>
            </Link>
            <Button 
              icon={course.visivel ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={handleToggleVisibility}
            >
              {course.visivel ? 'Tornar Privado' : 'Tornar Público'}
            </Button>
          </Space>
        </Col>
      </Row>

      <div className={styles.lessonsSection}>
        <div className={styles.lessonsHeader}>
          <Title level={3}>Aulas do Curso</Title>
          {hasChanges && (
              <Button type="primary" onClick={handleSaveChanges}>Salvar Alterações de Ordem</Button>
          )}
        </div>
        
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <List
              bordered
              dataSource={lessons}
              renderItem={(lesson) => (
                <SortableLesson key={lesson.id} lesson={lesson} courseId={id} onDelete={handleDeleteLesson} />
              )}
              locale={{ emptyText: "Nenhuma aula cadastrada." }}
            />
          </SortableContext>
        </DndContext>
        
        <Link href={`/adm/criar-aula?courseId=${course.id}`}>
          <Button type="primary" icon={<PlusOutlined />} className={styles.addLessonButton}>
            Adicionar Nova Aula
          </Button>
        </Link>
      </div>
    </div>
  );
}