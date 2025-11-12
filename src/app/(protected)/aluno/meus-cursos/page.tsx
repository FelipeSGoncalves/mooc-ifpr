"use client";

import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Input,
  Select,
  Card,
  List,
  Typography,
  Spin,
  Empty,
  Tag,
  App,
} from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import styles from "./MeusCursosPage.module.css";

import { getKnowledgeAreas, KnowledgeArea } from "@/services/courseService";
import { getMyCourses } from "@/services/enrollmentService";
import fallbackImage from "@/assets/thumbnailInformaticaDoZero.png";

const { Title } = Typography;
const { Search } = Input;
const { Meta } = Card;

interface MyCourse {
  enrollmentId: number;
  cursoId: number;
  nome: string;
  nomeProfessor: string;
  miniatura: string | null;
  cargaHoraria: number;
  concluido: boolean;
  campus: { id: number; nome: string };
  areaConhecimento: { id: number; nome: string };
}

export default function MeusCursosPage() {
  const { message } = App.useApp();
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [areaId, setAreaId] = useState<number | null>(null);
  const [status, setStatus] = useState<boolean | null>(null);
  const [direction, setDirection] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await getKnowledgeAreas();
        setKnowledgeAreas(data.conteudo || []);
      } catch (error) {
        message.error("Não foi possível carregar as áreas de conhecimento.");
      }
    };
    fetchAreas();
  }, [message]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await getMyCourses(searchTerm, status, direction);
        setCourses(data.conteudo || []);
      } catch (error) {
        message.error("Não foi possível carregar seus cursos.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [searchTerm, areaId, status, direction, message]);

  return (
    <div className={styles.container}>
      <Title level={2}>Meus Cursos</Title>

      <div className={styles.filterBar}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={12} lg={8}>
            <label>Pesquisar por nome</label>
            <Search
              placeholder="Digite o nome do curso"
              onSearch={(value) => setSearchTerm(value)}
              enterButton
              size="large"
            />
          </Col>
          <Col xs={24} md={6} lg={6}>
            <label>Filtrar por status</label>
            <Select
              allowClear
              placeholder="Todos"
              style={{ width: "100%" }}
              onChange={(value) => setStatus(value)}
              size="large"
              options={[
                { value: false, label: "Em andamento" },
                { value: true, label: "Concluídos" },
              ]}
            />
          </Col>
          <Col xs={24} md={6} lg={5}>
            <label>Filtrar por área</label>
            <Select
              allowClear
              placeholder="Todas as áreas"
              style={{ width: "100%" }}
              onChange={(value) => setAreaId(value)}
              size="large"
              options={knowledgeAreas.map((area) => ({
                value: area.id,
                label: area.name,
              }))}
            />
          </Col>
          <Col xs={24} md={6} lg={5}>
            <label>Ordenar por</label>
            <Select
              value={direction}
              style={{ width: "100%" }}
              onChange={(value) => setDirection(value)}
              size="large"
              options={[
                { value: "desc", label: "Mais Recentes" },
                { value: "asc", label: "Mais Antigos" },
              ]}
            />
          </Col>
        </Row>
      </div>
      {loading ? (
        <div className={styles.spinContainer}>
          <Spin size="large" />
        </div>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
          dataSource={courses}
          renderItem={(course) => (
            <List.Item>
              <Link href={`/aluno/cursos/${course.cursoId}`}>
                <Card
                  hoverable
                  className={styles.courseCard}
                  cover={
                    <Image
                      alt={course.nome}
                      src={course.miniatura || fallbackImage}
                      width={300}
                      height={170}
                      style={{ objectFit: "cover" }}
                    />
                  }
                >
                  <Tag color="blue" className={styles.areaTag}>
                    {course.areaConhecimento.nome}
                  </Tag>
                  <Meta title={course.nome} />
                  <div className={styles.cardFooter}>
                    <ClockCircleOutlined /> {course.cargaHoraria} horas
                  </div>
                  <div className={styles.statusTag}>
                    {course.concluido ? (
                      <Tag color="green">Concluído</Tag>
                    ) : (
                      <Tag color="processing">Em Andamento</Tag>
                    )}
                  </div>
                </Card>
              </Link>
            </List.Item>
          )}
          locale={{
            emptyText: <Empty description="Nenhum curso encontrado." />,
          }}
        />
      )}
    </div>
  );
}