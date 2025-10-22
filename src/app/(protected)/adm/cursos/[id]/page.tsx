"use client";

import { useState, useEffect } from "react";
import {
  Typography, Button, Row, Col, List, Spin, Empty, message, Space, Tag, Breadcrumb, Modal, App
} from "antd";
import { 
    EditOutlined, PlusOutlined, EyeOutlined, EyeInvisibleOutlined, DeleteOutlined, MenuOutlined
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./ApresentacaoCursoPage.module.css";
import { parseCookies } from 'nookies'; // <-- ADICIONADO AQUI

// Imports da biblioteca de Drag and Drop
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import fallbackImage from "@/assets/mooc.jpeg";

const { Title, Paragraph, Text } = Typography;

// --- Interfaces ---
interface Lesson {
  id: number;
  titulo: string;
  ordemAula: number; // Corrigido para corresponder ao backend
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
  const { message, modal } = App.useApp();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const id = params.id;

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
        // Atualiza a ordem para refletir a nova posição no array
        return newItems.map((item, index) => ({ ...item, ordemAula: index + 1 }));
      });
      setHasChanges(true);
    }
  };

  const handleDeleteLesson = (lessonId: number) => {
    modal.confirm({
      title: "Tem certeza que quer deletar esta aula?",
      content: "Esta ação não pode ser desfeita e deletará a aula permanentemente.",
      okText: "Sim, deletar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        // Implementar a chamada de API para deletar a aula aqui
        message.success("Funcionalidade de deletar a ser implementada.");
      }
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
        const response = await fetch(`${API_BASE_URL}/courses/${id}/lessons/reorder`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(reorderPayload)
        });

        if (!response.ok) throw new Error("Falha ao salvar a ordem das aulas.");
        
        message.success("Ordem das aulas salva com sucesso!");
        setHasChanges(false);
    } catch (error) {
        message.error("Não foi possível salvar as alterações.");
    }
  };

  const handleToggleVisibility = async () => {
    if (!course) return;
    const token = parseCookies().jwt_token;
    if (!token) {
      message.error("Autenticação necessária.");
      return;
    }
    const newVisibility = !course.visivel;
    const action = newVisibility ? "publicado" : "privado";
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ visivel: newVisibility }),
      });
      if (response.ok) {
        setCourse({ ...course, visivel: newVisibility });
        message.success(`Curso tornado ${action} com sucesso!`);
      } else {
        throw new Error("Falha ao atualizar visibilidade");
      }
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
          {
            title: <Link href="/adm/cursos">Catálogo de Cursos</Link>,
          },
          {
            title: course.nome,
          },
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
            // Se 'course.miniatura' existir, use-o, senão, use a imagem importada
            src={course.miniatura || fallbackImage}
            alt={`Thumbnail do curso ${course.nome}`}
            width={350}
            height={200}
            className={styles.thumbnail}
            priority // Ajuda a carregar a imagem principal da página mais rápido
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
                <SortableLesson key={lesson.id} lesson={lesson} onDelete={handleDeleteLesson} />
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