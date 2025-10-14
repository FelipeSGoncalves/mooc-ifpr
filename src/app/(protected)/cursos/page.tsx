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
import Link from "next/link"; // ADICIONADO: Import do Link para navegação

const { Title } = Typography;
const { Search } = Input;
const { Meta } = Card;

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
  const [direction, setDirection] = useState<string>("desc"); 

  useEffect(() => {
    const fetchKnowledgeAreas = async () => {
      try {
        // CORREÇÃO 1: Aumentar o tamanho da página para buscar mais áreas
        const response = await fetch(`${API_BASE_URL}/knowledge-area?size=100`);
        if (!response.ok) throw new Error("Falha ao buscar áreas");
        const data = await response.json();
        setKnowledgeAreas(data.conteudo || []);
      } catch (error) {
        console.error("Erro ao buscar áreas:", error);
        message.error("Não foi possível carregar as áreas de conhecimento.");
      }
    };
    fetchKnowledgeAreas();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("name", searchTerm);
        if (areaId) params.append("knowledgeAreaId", String(areaId));
        params.append("direction", direction);
        
        // CORREÇÃO 1: Adicionado o parâmetro 'size' para buscar mais cursos
        params.append("size", "100"); // Pede até 100 cursos

        const response = await fetch(`${API_BASE_URL}/courses?${params.toString()}`);
        if (!response.ok) throw new Error("Falha ao buscar cursos");
        const data = await response.json();
        setCourses(data.conteudo || []);
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
        message.error("Não foi possível carregar os cursos.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [searchTerm, areaId, direction]);

  const handleSearch = (value: string) => setSearchTerm(value);
  const handleAreaChange = (value: number) => setAreaId(value);
  const handleSortChange = (value: string) => setDirection(value);

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
              defaultValue={direction}
              style={{ width: "100%" }}
              onChange={handleSortChange}
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
              {/* CORREÇÃO 2: Card envolvido por um Link para a página de detalhes */}
              <Link href={`/cursos/${course.id}`}>
                <Card
                  hoverable
                  className={styles.courseCard}
                  cover={
                    <Image
                      alt={course.nome}
                      src={course.miniatura || "/assets/thumbnailInformaticaDoZero.png"}
                      width={300}
                      height={170}
                      style={{ objectFit: "cover" }}
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
              </Link>
            </List.Item>
          )}
          locale={{
            emptyText: (
              <Empty description="Nenhum curso encontrado." />
            ),
          }}
        />
      )}
    </div>
  );
}