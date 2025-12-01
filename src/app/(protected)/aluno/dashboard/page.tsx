"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Spin,
  Empty,
  App,
  Card,
  Tag,
  Carousel, 
  Button, 
} from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import styles from "./DashboardPage.module.css";

import { getCourses, Course } from "@/services/courseService";
import { getMyCourses } from "@/services/enrollmentService";
import fallbackImage from "@/assets/thumbnailInformaticaDoZero.png";

const { Title } = Typography;
const { Meta } = Card;


interface MyCourse {
  enrollmentId: number;
  cursoId: number;
  nome: string;
  miniatura: string | null;
  cargaHoraria: number;
  areaConhecimento: {
    id: number;
    nome: string;
  };
}


const carouselSettings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 4,
  responsive: [
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
      },
    },
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
      },
    },
    {
      breakpoint: 576,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};


export default function AlunoDashboardPage() {
  const { message } = App.useApp();
  const [inProgressCourses, setInProgressCourses] = useState<MyCourse[]>([]);
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [loadingInProgress, setLoadingInProgress] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  useEffect(() => {
    const fetchInProgressCourses = async () => {
      setLoadingInProgress(true);
      try {
        const data = await getMyCourses(undefined, false, "desc");
        setInProgressCourses(data.conteudo || []);
      } catch {
        message.error("Não foi possível carregar os cursos em andamento.");
      } finally {
        setLoadingInProgress(false);
      }
    };

    const fetchSuggestedCourses = async () => {
      setLoadingSuggestions(true);
      try {
        const data = await getCourses(undefined, null, "desc", true, false, "popularidade");
        setSuggestedCourses(data.conteudo || []);
      } catch {
        message.error("Não foi possível carregar as sugestões de cursos.");
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchInProgressCourses();
    fetchSuggestedCourses();
  }, [message]);
  
  const renderCourseCarousel = (loading: boolean, courses: (MyCourse | Course)[], isMyCourse: boolean) => {
    if (loading) {
      return (
        <div className={styles.spinContainer}>
          <Spin />
        </div>
      );
    }
    
    if (courses.length === 0) {
        return <Empty description={isMyCourse ? "Você não está matriculado em nenhum curso no momento." : "Nenhum curso para sugerir no momento."} />;
    }

    return (
        <Carousel {...carouselSettings} arrows>
        {courses.map((course) => {
          const courseId = isMyCourse ? (course as MyCourse).cursoId : (course as Course).id;
          return (
            <div key={courseId} className={styles.carouselItem}>
              <Link href={`/aluno/cursos/${courseId}`}>
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
                </Card>
              </Link>
            </div>
          );
        })}
      </Carousel>
    );
  };


  return (
    <div className={styles.container}>
      <Title level={2}>Dashboard do Aluno</Title>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
            <Title level={3}>Cursos em Andamento</Title>
            <Link href="/aluno/meus-cursos">
                <Button type="link">Ver Mais</Button>
            </Link>
        </div>
        {renderCourseCarousel(loadingInProgress, inProgressCourses, true)}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
            <Title level={3}>Sugestões de Cursos</Title>
            <Link href="/aluno/cursos">
                <Button type="link">Ver Mais</Button>
            </Link>
        </div>
        {renderCourseCarousel(loadingSuggestions, suggestedCourses, false)}
      </section>
    </div>
  );
}