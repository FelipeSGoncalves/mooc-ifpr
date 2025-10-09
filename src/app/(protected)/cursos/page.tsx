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
  message,
} from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import styles from "./CursosPage.module.css";
import Image from "next/image";

const { Title } = Typography;
const { Search } = Input;
const { Meta } = Card;

// --- Interfaces para corresponder 100% à API ---
interface KnowledgeArea {
  id: number;
  name: string;
}

interface Course {
  id: number;
  nome: string;
  miniatura: string | null;
  cargaHoraria: number;
  nomeAreaConhecimento: string;
}

const API_BASE_URL = "http://localhost:8080/mooc";

export default function CursosPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [areaId, setAreaId] = useState<number | null>(null);
  const [sort, setSort] = useState<string>("nome,asc");

  // Efeito para buscar as Áreas de Conhecimento (para o filtro)
  useEffect(() => {
    const fetchKnowledgeAreas = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/knowledge-area`);
        if (!response.ok) {
          throw new Error("Falha ao buscar áreas de conhecimento");
        }
        const data = await response.json();
        setKnowledgeAreas(data.conteudo || []);
      } catch (error) {
        console.error(error);
        message.error("Não foi possível carregar as áreas de conhecimento.");
      }
    };
    fetchKnowledgeAreas();
  }, []);

  // Efeito para buscar os Cursos (com filtros e ordenação)
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("nome", searchTerm);
        if (areaId) params.append("areaId", String(areaId));
        params.append("sort", sort);

        const response = await fetch(`${API_BASE_URL}/courses?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Falha ao buscar os cursos");
        }
        const data = await response.json();
        setCourses(data.conteudo || []);
      } catch (error) {
        console.error(error);
        message.error("Não foi possível carregar os cursos.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchTerm, areaId, sort]);

  const handleSearch = (value: string) => setSearchTerm(value);
  const handleAreaChange = (value: number) => setAreaId(value);
  const handleSortChange = (value: string) => setSort(value);

  return (
    <div className={styles.container}>
      <Title level={2}>Catálogo de Cursos</Title>
      <div className={styles.filterBar}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={12} lg={10}>
            <label>Pesquisar por nome</label>
            <Search
              placeholder="Digite o nome do curso"
              onSearch={handleSearch}
              enterButton
              size="large"
            />
          </Col>
          <Col xs={24} md={6} lg={7}>
            <label>Filtrar por área</label>
            <Select
              allowClear
              placeholder="Todas as áreas"
              style={{ width: "100%" }}
              onChange={handleAreaChange}
              size="large"
              options={knowledgeAreas.map((area) => ({
                value: area.id,
                label: area.name,
              }))}
            />
          </Col>
          <Col xs={24} md={6} lg={7}>
            <label>Ordenar por</label>
            <Select
              defaultValue={sort}
              style={{ width: "100%" }}
              onChange={handleSortChange}
              size="large"
              options={[
                { value: "nome,asc", label: "Nome (A-Z)" },
                { value: "nome,desc", label: "Nome (Z-A)" },
                { value: "id,desc", label: "Mais Recentes" },
                { value: "id,asc", label: "Mais Antigos" },
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
              <Card
                hoverable
                className={styles.courseCard}
                cover={
                  <Image
                    alt={course.nome}
                    src={course.miniatura || "/src/assets/mooc.jpeg"}
                    width={300}
                    height={170}
                    style={{ objectFit: 'cover' }}
                  />
                }
              >
                <Tag color="blue" className={styles.areaTag}>
                  {course.nomeAreaConhecimento}
                </Tag>
                <Meta title={course.nome} />
                <div className={styles.cardFooter}>
                  <ClockCircleOutlined /> {course.cargaHoraria} horas
                </div>
              </Card>
            </List.Item>
          )}
          locale={{
            emptyText: <Empty description="Nenhum curso encontrado para os filtros selecionados." />,
          }}
        />
      )}
    </div>
  );
}