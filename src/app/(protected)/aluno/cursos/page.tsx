"use client";

import { useState, useEffect } from "react";
import { Row, Col, Input, Select, Card, List, Typography, Spin, Empty, Tag, App } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import styles from "./CatalogoPage.module.css";

import { getCourses, getKnowledgeAreas, Course, KnowledgeArea } from "@/services/courseService";
import fallbackImage from "@/assets/thumbnailInformaticaDoZero.png";

const { Title } = Typography;
const { Search } = Input;
const { Meta } = Card;

export default function CatalogoPage() {
  const { message } = App.useApp();
  const [courses, setCourses] = useState<Course[]>([]);
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [areaId, setAreaId] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<string>("newest"); // Estado local

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await getKnowledgeAreas();
        setKnowledgeAreas(data.conteudo || []);
      } catch {
        message.error("Não foi possível carregar as áreas.");
      }
    };
    fetchAreas();
  }, [message]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await getCourses(searchTerm, areaId, "desc", true);
        const lista = data.conteudo || [];

        // ORDENAÇÃO CLIENT-SIDE
        switch (sortOption) {
            case "oldest": lista.sort((a, b) => a.id - b.id); break;
            case "workload_desc": lista.sort((a, b) => b.cargaHoraria - a.cargaHoraria); break;
            case "workload_asc": lista.sort((a, b) => a.cargaHoraria - b.cargaHoraria); break;
            case "az": lista.sort((a, b) => a.nome.localeCompare(b.nome)); break;
            case "za": lista.sort((a, b) => b.nome.localeCompare(a.nome)); break;
            default: lista.sort((a, b) => b.id - a.id); break;
        }

        setCourses(lista);
      } catch {
        message.error("Não foi possível carregar os cursos.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [searchTerm, areaId, sortOption, message]);

  return (
    <div className={styles.container}>
      <Title level={2}>Catálogo de Cursos</Title>
      <div className={styles.filterBar}>
        <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} md={12} lg={10}><label>Pesquisar por nome</label><Search placeholder="Digite o nome do curso" onSearch={(value) => setSearchTerm(value)} enterButton size="large"/></Col>
            <Col xs={24} md={6} lg={7}><label>Filtrar por área</label><Select allowClear placeholder="Todas as áreas" style={{ width: "100%" }} onChange={(value) => setAreaId(value)} size="large" options={knowledgeAreas.map((area) => ({ value: area.id, label: area.name, }))}/></Col>
            <Col xs={24} md={6} lg={7}>
                <label>Ordenar por</label>
                <Select 
                    value={sortOption} 
                    style={{ width: "100%" }} 
                    onChange={(value) => setSortOption(value)} 
                    size="large" 
                    options={[
                        { label: "Mais Recentes", value: "newest" },
                        { label: "Mais Antigos", value: "oldest" },
                        { label: "Maior Carga Horária", value: "workload_desc" },
                        { label: "Menor Carga Horária", value: "workload_asc" },
                        { label: "A-Z", value: "az" },
                        { label: "Z-A", value: "za" },
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
              <Link href={`/aluno/cursos/${course.id}`}>
                <Card hoverable className={styles.courseCard} cover={ <Image alt={course.nome} src={course.miniatura || fallbackImage} width={300} height={170} style={{ objectFit: "cover" }}/> }>
                  <Tag color="blue" className={styles.areaTag}> {course.areaConhecimento.nome} </Tag>
                  <Meta title={course.nome} />
                  <div className={styles.cardFooter}> <ClockCircleOutlined /> {course.cargaHoraria} horas </div>
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