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
import { ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import styles from "./HomePage.module.css";

import { getCourses, Course } from "@/services/courseService";
import fallbackImage from "@/assets/thumbnailInformaticaDoZero.png";
import heroImage from "@/assets/pessoasLogin.png"; 

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

// Configurações do carrossel (semelhante ao da dashboard do aluno)
const carouselSettings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 4,
  responsive: [
    { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 3 } },
    { breakpoint: 992, settings: { slidesToShow: 2, slidesToScroll: 2 } },
    { breakpoint: 576, settings: { slidesToShow: 1, slidesToScroll: 1 } },
  ],
};

export default function HomePage() {
  const { message } = App.useApp();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Busca os cursos mais recentes que estão visíveis para o público
        const data = await getCourses(undefined, null, "desc", true);
        setCourses(data.conteudo || []);
      } catch {
        message.error("Não foi possível carregar os cursos.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [message]);

  const renderCourseCarousel = () => {
    if (loading) {
      return <div className={styles.spinContainer}><Spin /></div>;
    }
    if (courses.length === 0) {
      return <Empty description="Nenhum curso disponível no momento." />;
    }
    return (
      <Carousel {...carouselSettings} arrows className={styles.carousel}>
        {courses.map((course) => (
          <div key={course.id} className={styles.carouselItem}>
            <Link href={`/curso/${course.id}`}>
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
        ))}
      </Carousel>
    );
  };

  return (
    <div className={styles.container}>
      <section className={styles.heroSection}>
        <div className={styles.heroImage}>
          <Image src={heroImage} alt="Ilustração de pessoas estudando online" priority fill sizes="(max-width: 991px) 100vw, 50vw" />
        </div>
        <div className={styles.heroText}>
          <Title level={2}>Bem-vindo ao MOOC IFPR 🎓</Title>
          <Paragraph>
            O MOOC IFPR - Campus Foz do Iguaçu é a plataforma oficial de
            cursos online gratuitos do Instituto Federal do Paraná. Nosso
            objetivo é ampliar o acesso ao conhecimento por meio de cursos
            abertos, acessíveis e certificados, garantindo qualidade e
            praticidade para todos os participantes.
          </Paragraph>
          <div className={styles.benefitsList}>
            <Text><CheckCircleOutlined /> Cursos de extensão online e gratuitos</Text>
            <Text><CheckCircleOutlined /> Emissão automática de certificados digitais validados pelo IFPR</Text>
            <Text><CheckCircleOutlined /> Acesso simples, rápido e seguro</Text>
          </div>
          <Link href="/catalogo">
            <Button type="primary" size="large" className={styles.heroButton}>Explorar Cursos</Button>
          </Link>
        </div>
      </section>

      <section className={styles.coursesSection}>
        <Title level={3}>Principais Cursos</Title>
        {renderCourseCarousel()}
      </section>
    </div>
  );
}