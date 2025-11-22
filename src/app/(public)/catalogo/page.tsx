"use client";

import { useState, useEffect } from "react";
import { Input, Select, Spin, App } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

import { getCourses, getKnowledgeAreas, Course, KnowledgeArea } from "@/services/courseService";
import { useAuth } from "@/hooks/useAuth";
import fallbackImage from "@/assets/thumbnailInformaticaDoZero.png";

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
  
  // Estado para controlar a ordenação local
  const [sortOption, setSortOption] = useState<string>("newest");

  useEffect(() => {
    getKnowledgeAreas()
      .then(data => setKnowledgeAreas(data.conteudo || []))
      .catch(() => message.error("Não foi possível carregar as áreas."));
  }, [message]);

  useEffect(() => {
    setLoading(true);
    // Buscamos sempre ordenado por ID decrescente (mais novos) do back
    getCourses(searchTerm, selectedArea, "desc", true)
      .then(data => {
        const lista = data.conteudo || [];

        // --- LÓGICA DE ORDENAÇÃO NO FRONT-END ---
        switch (sortOption) {
            case "oldest":
                lista.sort((a, b) => a.id - b.id);
                break;
            case "workload_desc": // Maior carga horária
                lista.sort((a, b) => b.cargaHoraria - a.cargaHoraria);
                break;
            case "workload_asc": // Menor carga horária
                lista.sort((a, b) => a.cargaHoraria - b.cargaHoraria);
                break;
            case "az": // Nome A-Z
                lista.sort((a, b) => a.nome.localeCompare(b.nome));
                break;
            case "za": // Nome Z-A
                lista.sort((a, b) => b.nome.localeCompare(a.nome));
                break;
            case "newest":
            default:
                lista.sort((a, b) => b.id - a.id);
                break;
        }
        // ----------------------------------------

        setCourses(lista);
      })
      .catch(() => message.error("Não foi possível carregar os cursos."))
      .finally(() => setLoading(false));
  }, [searchTerm, selectedArea, sortOption, message]); // sortOption dispara o efeito novamente

  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.title}>Catálogo de Cursos</h1>
          <p className={styles.subtitle}>
            Explore os cursos disponíveis no MOOC IFPR.
          </p>
        </header>
        <div className={styles.controls}>
          <div className={styles.search}>
            <Input size="large" placeholder="Pesquisar..." allowClear prefix={<SearchOutlined style={{ color: "rgba(3, 138, 113, 0.6)" }} />} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
          </div>
          <div className={styles.filters}>
            <Select size="large" placeholder="Área" options={knowledgeAreas.map(area => ({ label: area.name, value: area.id }))} allowClear value={selectedArea ?? undefined} onChange={(value) => setSelectedArea(value ?? null)} />
            
            {/* SELECT COM NOVAS OPÇÕES */}
            <Select 
                size="large" 
                placeholder="Ordenar" 
                value={sortOption} 
                onChange={(value) => setSortOption(value)} 
                options={[
                    { label: "Mais Recentes", value: "newest" },
                    { label: "Mais Antigos", value: "oldest" },
                    { label: "Maior Carga Horária", value: "workload_desc" },
                    { label: "Menor Carga Horária", value: "workload_asc" },
                    { label: "Nome (A-Z)", value: "az" },
                    { label: "Nome (Z-A)", value: "za" },
                ]} 
            />
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