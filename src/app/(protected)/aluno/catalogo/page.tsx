"use client";

import { useState, useEffect } from "react";
import { Row, Col, Input, Select, Card, List, Typography, Spin, Empty, Tag, message } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import styles from "./CatalogoPage.module.css";

// IMPORTAÇÕES CORRIGIDAS: Usando os serviços centralizados
import { getCourses, getKnowledgeAreas, Course, KnowledgeArea } from "@/services/courseService";

const { Title } = Typography;
const { Search } = Input;
const { Meta } = Card;

export default function CatalogoPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [areaId, setAreaId] = useState<number | null>(null);
  const [direction, setDirection] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await getKnowledgeAreas();
        setKnowledgeAreas(data.conteudo || []);
      } catch (error) {
        console.error("Erro ao buscar áreas:", error);
        message.error("Não foi possível carregar as áreas de conhecimento.");
      }
    };
    fetchAreas();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // DIFERENÇA PRINCIPAL: Passando 'true' para o parâmetro 'visible'
        const data = await getCourses(searchTerm, areaId, direction, true);
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

  return (
    <div className={styles.container}>
      <Title level={2}>Catálogo de Cursos</Title>
      <div className={styles.filterBar}>
        <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} md={12} lg={10}>
                <label>Pesquisar por nome</label>
                <Search
                    placeholder="Digite o nome do curso"
                    onSearch={(value) => setSearchTerm(value)}
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
                    onChange={(value) => setAreaId(value)}
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
        <div className={styles.spinContainer}><Spin size="large" /></div>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
          dataSource={courses}
          renderItem={(course) => (
            <List.Item>
              {/* DIFERENÇA NO LINK: Aponta para a visualização pública do curso */}
              <Link href={`/curso/${course.id}`}>
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
                    {/* CORREÇÃO DA INTERFACE: Acessando o nome da área corretamente */}
                    {course.areaConhecimento.nome}
                  </Tag>
                  <Meta title={course.nome} />
                  <div className={styles.cardFooter}>
                    <ClockCircleOutlined /> {course.cargaHoraria} horas
                  </div>
                </Card>
              </Link>
            </List.Item>
          )}
          locale={{ emptyText: <Empty description="Nenhum curso encontrado." /> }}
        />
      )}
    </div>
  );
}