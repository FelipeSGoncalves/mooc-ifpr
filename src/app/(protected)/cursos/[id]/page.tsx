"use client";

import { useState, useEffect } from "react";
import {
  Typography, Button, Row, Col, List, Spin, Empty, message, Space, Tag, Breadcrumb, Modal
} from "antd";
import { 
    EditOutlined, PlusOutlined, EyeOutlined, EyeInvisibleOutlined, DeleteOutlined, MenuOutlined
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./ApresentacaoCursoPage.module.css";

// Imports da biblioteca de Drag and Drop (dnd-kit)
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Title, Paragraph, Text } = Typography;

// --- Interfaces ---
interface Lesson {
  id: number;
  titulo: string;
  ordem: number;
}
interface CourseDetails {
  id: number;
  nome: string;
  descricao: string;
  nomeProfessor: string;
  miniatura: string | null;
  cargaHoraria: number;
  visivel: boolean;
  areaConhecimento: { id: number; nome: string };
  aulas: Lesson[];
}

const API_BASE_URL = "http://localhost:8080/mooc";

// Componente de Item Arrastável
const SortableLesson = ({ lesson, onDelete }: { lesson: Lesson, onDelete: (id: number) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <List.Item
            ref={setNodeRef}
            style={style}
            className={styles.lessonItem}
            actions={[
                <Button type="link" danger icon={<DeleteOutlined />} onClick={() => onDelete(lesson.id)} />,
                <Button type="text" {...attributes} {...listeners} icon={<MenuOutlined />} className={styles.dragHandle} />
            ]}
        >
            <List.Item.Meta title={<Text>{lesson.titulo}</Text>} />
        </List.Item>
    );
};


export default function ApresentacaoCursoPage() {
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const isAdmin = true; // Simulação de admin

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    if (!id) return;
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/courses/${id}`);
        if (!response.ok) throw new Error("Falha ao buscar detalhes do curso");
        const data = await response.json();
        setCourse(data);
        setLessons(data.aulas ? [...data.aulas].sort((a, b) => a.ordem - b.ordem) : []); // Garante a ordem inicial
      } catch (error) {
        console.error(error);
        message.error("Não foi possível carregar os detalhes do curso.");
        router.push("/cursos");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id, router]);
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLessons((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, ordem: index + 1 }));
      });
      setHasChanges(true);
    }
  };

  const handleDeleteLesson = (lessonId: number) => {
    Modal.confirm({
      title: "Tem certeza que quer deletar esta aula?",
      content: "A alteração só será permanente após clicar em 'Salvar Alterações'.",
      okText: "Sim, deletar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: () => {
        setLessons(currentLessons => currentLessons.filter(lesson => lesson.id !== lessonId));
        setHasChanges(true);
        message.info("Aula removida localmente. Salve as alterações para confirmar.");
      }
    });
  };
  
  const handleSaveChanges = async () => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
        message.error("Autenticação necessária.");
        return;
    }
    
    const reorderPayload = {
        aulas: lessons.map(lesson => ({ id: lesson.id, ordemAula: lesson.ordem }))
    };

    console.log(reorderPayload);

    try {
        const response = await fetch(`${API_BASE_URL}/courses/${id}/lessons/reorder`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(reorderPayload)
        });

        if (!response.ok) throw new Error("Falha ao salvar a ordem das aulas.");
        
        message.success("Alterações salvas com sucesso!");
        setHasChanges(false);
    } catch (error) {
        console.error(error);
        message.error("Não foi possível salvar as alterações.");
    }
  };

  const handleToggleVisibility = async () => {
    if (!course) return;
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      message.error("Autenticação necessária.");
      return;
    }
    const newVisibility = !course.visivel;
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ visivel: newVisibility }),
      });
      if (response.ok) {
        setCourse({ ...course, visivel: newVisibility });
        message.success(`Curso ${newVisibility ? 'publicado' : 'privado'} com sucesso!`);
      } else {
        throw new Error("Falha ao atualizar visibilidade");
      }
    } catch (error) {
      console.error(error);
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
      <Breadcrumb className={styles.breadcrumb}>
        <Breadcrumb.Item><Link href="/cursos">Catálogo de Cursos</Link></Breadcrumb.Item>
        <Breadcrumb.Item>{course.nome}</Breadcrumb.Item>
      </Breadcrumb>

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
            src={course.miniatura || "/assets/mooc.jpeg"}
            alt={`Thumbnail do curso ${course.nome}`}
            width={350}
            height={200}
            className={styles.thumbnail}
          />
          {isAdmin && (
            <Space className={styles.adminActions}>
              <Button type="primary" icon={<EditOutlined />}>Editar Curso</Button>
              <Button 
                icon={course.visivel ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={handleToggleVisibility}
              >
                {course.visivel ? 'Tornar Privado' : 'Tornar Público'}
              </Button>
            </Space>
          )}
        </Col>
      </Row>

      {isAdmin && (
        <div className={styles.lessonsSection}>
          <div className={styles.lessonsHeader}>
            <Title level={3}>Aulas do Curso</Title>
            {hasChanges && (
                <Button type="primary" onClick={handleSaveChanges}>Salvar Alterações</Button>
            )}
          </div>
          
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
              <List
                bordered
                dataSource={lessons}
                renderItem={(lesson) => (
                  
                  <SortableLesson  key={lesson.ordem} lesson={lesson} onDelete={handleDeleteLesson} />
                )}
                locale={{ emptyText: "Nenhuma aula cadastrada." }}
              />
            </SortableContext>
          </DndContext>
          
          <Link href={`/criar-aula?courseId=${course.id}`}>
            <Button type="primary" icon={<PlusOutlined />} className={styles.addLessonButton}>
              Adicionar Aula
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}