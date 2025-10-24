"use client";

import { useState, useEffect } from "react";
import { Typography, Button, Spin, Empty, App } from "antd";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

import { getCourseDetails, CourseDetails } from "@/services/courseService";

const { Title, Paragraph } = Typography;

export default function PublicCoursePage() {
  const { message } = App.useApp();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await getCourseDetails(id);
        if (!data.visivel) throw new Error("Course not found");
        setCourse(data);
      } catch (error) {
        message.error("Course not found or is unavailable.");
        router.push("/catalogo");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, router, message]);

  if (loading) {
    return <div className={styles.wrapper}><Spin size="large" /></div>;
  }

  if (!course) {
    return <div className={styles.wrapper}><Empty description="Course not found." /></div>;
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <Title level={2}>{course.nome}</Title>
        <Paragraph>{course.descricao}</Paragraph>
        <Paragraph>
          To enroll and get full access to the lessons, please log in.
        </Paragraph>
        <Link href={`/auth/login?redirect=/aluno/cursos/${id}`} passHref>
          <Button type="primary" size="large">
            Log in to Enroll
          </Button>
        </Link>
        <Link href="/catalogo" className={styles.link}>
          ← Back to catalog
        </Link>
      </div>
    </section>
  );
}