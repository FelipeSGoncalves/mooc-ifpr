"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Input, Select } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import styles from "./page.module.css";

type Course = {
  id: string;
  title: string;
  hours: number;
  area: string;
  thumbnail: string;
};

const courses: Course[] = [
  {
    id: "informatica-do-zero",
    title: "Informática do Zero",
    hours: 10,
    area: "Tecnologia",
    thumbnail: "/catalogo_cursos_alunos.png",
  },
  {
    id: "introducao-programacao",
    title: "Introdução à Programação",
    hours: 40,
    area: "Tecnologia",
    thumbnail: "/catalogo_cursos_alunos.png",
  },
  {
    id: "excel-produtividade",
    title: "Excel para Produtividade",
    hours: 20,
    area: "Gestão",
    thumbnail: "/catalogo_cursos_alunos.png",
  },
  {
    id: "design-grafico-basico",
    title: "Design Gráfico Básico",
    hours: 30,
    area: "Criatividade",
    thumbnail: "/catalogo_cursos_alunos.png",
  },
  {
    id: "empreendedorismo",
    title: "Empreendedorismo na Prática",
    hours: 16,
    area: "Negócios",
    thumbnail: "/catalogo_cursos_alunos.png",
  },
  {
    id: "educacao-financeira",
    title: "Educação Financeira",
    hours: 18,
    area: "Negócios",
    thumbnail: "/catalogo_cursos_alunos.png",
  },
  {
    id: "ingles-conversacao",
    title: "Inglês para Conversação",
    hours: 24,
    area: "Idiomas",
    thumbnail: "/catalogo_cursos_alunos.png",
  },
  {
    id: "fotografia-digital",
    title: "Fotografia Digital",
    hours: 12,
    area: "Criatividade",
    thumbnail: "/catalogo_cursos_alunos.png",
  },
  {
    id: "marketing-digital",
    title: "Marketing Digital",
    hours: 28,
    area: "Negócios",
    thumbnail: "/catalogo_cursos_alunos.png",
  },
  {
    id: "logica-computacao",
    title: "Lógica de Computação",
    hours: 14,
    area: "Tecnologia",
    thumbnail: "/catalogo_cursos_alunos.png",
  },
  {
    id: "producao-conteudo",
    title: "Produção de Conteúdo",
    hours: 22,
    area: "Comunicação",
    thumbnail: "/catalogo_cursos_alunos.png",
  },
  {
    id: "soft-skills",
    title: "Soft Skills para Carreira",
    hours: 15,
    area: "Desenvolvimento Pessoal",
    thumbnail: "/catalogo_cursos_alunos.png",
  },
];

type SortOption = "alphabetical" | "hoursDesc" | "hoursAsc";

export default function CatalogoCursos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("alphabetical");

  const areaOptions = useMemo(
    () =>
      Array.from(new Set(courses.map((course) => course.area)))
        .sort((a, b) => a.localeCompare(b))
        .map((area) => ({ label: area, value: area })),
    [],
  );

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = courses.filter((course) => {
      const matchesSearch = normalizedSearch
        ? course.title.toLowerCase().includes(normalizedSearch) ||
          course.area.toLowerCase().includes(normalizedSearch)
        : true;
      const matchesArea = selectedArea ? course.area === selectedArea : true;
      return matchesSearch && matchesArea;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortOption === "hoursDesc") {
        return b.hours - a.hours;
      }
      if (sortOption === "hoursAsc") {
        return a.hours - b.hours;
      }
      return a.title.localeCompare(b.title);
    });

    return sorted;
  }, [searchTerm, selectedArea, sortOption]);

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
            <Input
              size="large"
              placeholder="Pesquisar..."
              allowClear
              prefix={<SearchOutlined style={{ color: "rgba(3, 138, 113, 0.6)" }} />}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Pesquisar cursos"
            />
          </div>

          <div className={styles.filters}>
            <Select
              size="large"
              placeholder="Área"
              options={areaOptions}
              allowClear
              value={selectedArea ?? undefined}
              onChange={(value) => setSelectedArea(value ?? null)}
              aria-label="Filtrar por área"
            />
            <Select
              size="large"
              placeholder="Ordenar"
              value={sortOption}
              onChange={(value) => setSortOption(value)}
              options={[
                { label: "Nome (A-Z)", value: "alphabetical" },
                { label: "Maior carga horária", value: "hoursDesc" },
                { label: "Menor carga horária", value: "hoursAsc" },
              ]}
              aria-label="Ordenar resultados"
            />
          </div>
        </div>

        {filteredCourses.length ? (
          <div className={styles.grid}>
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                href={`/curso/${course.id}`}
                className={styles.cardLink}
                aria-label={`Ver detalhes do curso ${course.title}`}
              >
                <article className={styles.card}>
                  <div className={styles.thumbWrapper}>
                    <Image
                      src={course.thumbnail}
                      alt={`Thumb do curso ${course.title}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 220px"
                    />
                  </div>
                  <div className={styles.content}>
                    <h3 className={styles.name}>{course.title}</h3>
                    <div className={styles.meta}>
                      <span className={styles.areaTag}>{course.area}</span>
                      <span className={styles.hours}>{course.hours}h</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            Nenhum curso encontrado com os filtros atuais. Tente ajustar a pesquisa ou selecionar
            outra área.
          </div>
        )}
      </div>
    </section>
  );
}
