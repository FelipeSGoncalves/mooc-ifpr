"use client";

import { useState, useEffect } from "react";
import { Row, Col, Input, Select, Card, List, Typography, Spin, Empty, Tag, App } from "antd";
import { ClockCircleOutlined, SearchOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

import { getCourses, getKnowledgeAreas, Course, KnowledgeArea } from "@/services/courseService";
import { useAuth } from "@/hooks/useAuth"; // 1. Importar o hook de autenticação
import fallbackImage from "@/assets/thumbnailInformaticaDoZero.png";

const { Title } = Typography;
const { Meta } = Card;

const CourseCardLink = ({ course, children }: { course: Course, children: React.ReactNode }) => {
  const { user } = useAuth();
  const href = user ? `/aluno/cursos/${course.id}` : `/curso/${course.id}`;
  
  return <Link href={href}>{children}</Link>;
};

export default function CatalogoCursos() {
  const { message } = App.useApp();
  const [courses, setCourses] = useState<Course[]>([]);
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    getKnowledgeAreas()
      .then(data => setKnowledgeAreas(data.conteudo || []))
      .catch(() => message.error("Não foi possível carregar as áreas de conhecimento."));
  }, [message]);

  useEffect(() => {
    setLoading(true);
    getCourses(searchTerm, selectedArea, sortOption, true)
      .then(data => setCourses(data.conteudo || []))
      .catch(() => message.error("Não foi possível carregar os cursos."))
      .finally(() => setLoading(false));
  }, [searchTerm, selectedArea, sortOption, message]);

  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.title}>Catálogo de Cursos</h1>
          <p className={styles.subtitle}>
            Explore os cursos disponíveis no MOOC IFPR. Utilize os filtros para encontrar a
            formação ideal para o seu momento e inicie uma nova jornada de aprendizado.
          </p>
        </header>
        <div className={styles.controls}>
          <div className={styles.search}>
            <Input size="large" placeholder="Pesquisar..." allowClear prefix={<SearchOutlined style={{ color: "rgba(3, 138, 113, 0.6)" }} />} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} aria-label="Pesquisar cursos" />
          </div>
          <div className={styles.filters}>
            <Select size="large" placeholder="Área" options={knowledgeAreas.map(area => ({ label: area.name, value: area.id }))} allowClear value={selectedArea ?? undefined} onChange={(value) => setSelectedArea(value ?? null)} aria-label="Filtrar por área" />
            <Select size="large" placeholder="Ordenar" value={sortOption} onChange={(value) => setSortOption(value)} options={[{ label: "Mais Recentes", value: "desc" },{ label: "Mais Antigos", value: "asc" },]} aria-label="Ordenar resultados" />
          </div>
        </div>

        {loading ? <div className={styles.grid}><Spin size="large"/></div> : (
          <div className={styles.grid}>
            {courses.map((course) => (
              <CourseCardLink key={course.id} course={course}>
                <article className={styles.card}>
                  <div className={styles.thumbWrapper}>
                    <Image
                      src={course.miniatura || fallbackImage}
                      alt={`Thumb do curso ${course.nome}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 220px"
                    />
                  </div>
                  <div className={styles.content}>
                    <h3 className={styles.name}>{course.nome}</h3>
                    <div className={styles.meta}>
                      <span className={styles.areaTag}>{course.areaConhecimento.nome}</span>
                      <span className={styles.hours}>{course.cargaHoraria}h</span>
                    </div>
                  </div>
                </article>
              </CourseCardLink>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}