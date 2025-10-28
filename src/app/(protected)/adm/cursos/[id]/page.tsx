"use client";

import { useState, useEffect } from "react";
import {
  Typography, Button, Row, Col, List, Spin, Empty, App, Space, Tag, Breadcrumb, Modal
} from "antd";
import { 
    EditOutlined, PlusOutlined, EyeOutlined, EyeInvisibleOutlined, DeleteOutlined, MenuOutlined
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./ApresentacaoCursoPage.module.css";
import { parseCookies } from 'nookies';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { getCourseDetails, CourseDetails, updateCourse } from "@/services/courseService";
import { apiRequest, ApiError } from "@/services/api";
import fallbackImage from "@/assets/mooc.jpeg";

const { Title, Paragraph, Text } = Typography;

interface Lesson {
  id: number;
  titulo: string;
  ordemAula: number;
}

// Componente de Item Arrastável ATUALIZADO com botão de Editar
const SortableLesson = ({ lesson, courseId, onDelete }: { lesson: Lesson, courseId: string, onDelete: (id: number) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <List.Item ref={setNodeRef} style={style} className={styles.lessonItem}
            actions={[
                // --- BOTÃO DE EDITAR ADICIONADO ---
                <Link href={`/adm/cursos/${courseId}/aula/${lesson.id}/editar`} passHref>
                  <Button type="link" icon={<EditOutlined />} />
                </Link>,
                <Button type="link" danger icon={<DeleteOutlined />} onClick={() => onDelete(lesson.id)} />,
                <Button type="text" {...attributes} {...listeners} icon={<MenuOutlined />} className={styles.dragHandle} />
            ]}
        >
            <List.Item.Meta title={<Text>{lesson.titulo}</Text>} />
        </List.Item>
    );
};

export default function ApresentacaoCursoPage() {
  const { message, modal } = App.useApp();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
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

  const handleDeleteLesson = (lessonId: number) => {
    modal.confirm({
      title: "Tem certeza que quer deletar esta aula?",
      content: "Esta ação não pode ser desfeita. (Funcionalidade de deletar ainda não implementada no backend).",
      okText: "Sim, deletar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => { message.info("Funcionalidade de deletar a ser implementada."); }
    });
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

  const handleToggleVisibility = async () => {
    if (!course) return;
    
    // ATENÇÃO: A lógica de toggle foi simplificada, assumindo que o DTO do PUT aceita apenas os campos necessários.
    // O ideal seria ter um endpoint PATCH para isso, mas PUT funciona.
    const newVisibility = !course.visivel;
    const action = newVisibility ? "publicado" : "privado";
    try {
        // Criamos um payload apenas com os campos que o `CourseUpdateReqDto` espera.
        const updatePayload = {
            nome: course.nome,
            descricao: course.descricao,
            areaConhecimentoId: course.areaConhecimento.id,
            campusId: 1, // Assumindo campusId 1, idealmente viria do `course.campus.id`
            nomeProfessor: course.nomeProfessor,
            cargaHoraria: course.cargaHoraria,
            visivel: newVisibility,
        };

        await updateCourse(course.id, updatePayload);

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