"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Spin,
  Empty,
  App,
  List,
  Card,
  Button,
  Input, 
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import Image from "next/image";
import styles from "./CertificadosPage.module.css";

import { getMyCourses } from "@/services/enrollmentService";
import { generateCertificate } from "@/services/certificateService";
import { ApiError } from "@/services/api";
import fallbackImage from "@/assets/thumbnailInformaticaDoZero.png";

const { Title } = Typography;
const { Search } = Input;


interface CertificateCourse {
  enrollmentId: number;
  cursoId: number;
  nome: string;
  miniatura: string | null;
}

export default function CertificadosPage() {
  const { message } = App.useApp();
  const [allCompletedCourses, setAllCompletedCourses] = useState<CertificateCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CertificateCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCompletedCourses = async () => {
      setLoading(true);
      try {
        const data = await getMyCourses(undefined, true, "desc");
        setAllCompletedCourses(data.conteudo || []);
        setFilteredCourses(data.conteudo || []);
      } catch (error) {
        message.error("Não foi possível carregar seus certificados.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedCourses();
  }, [message]);
  
  useEffect(() => {
    const filtered = allCompletedCourses.filter(course =>
      course.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchTerm, allCompletedCourses]);


  const handleDownload = async (enrollmentId: number, courseName: string) => {
    setDownloading(enrollmentId);
    try {
      await generateCertificate(enrollmentId);
      message.success(`Download do certificado de "${courseName}" iniciado!`);
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : "Não foi possível baixar o certificado.";
      message.error(errorMessage);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.spinContainer}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Title level={2}>Meus Certificados</Title>
      
      <Search
          placeholder="Pesquisar certificado por nome do curso..."
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchBar}
          size="large"
      />
      
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
        dataSource={filteredCourses}
        renderItem={(course) => (
          <List.Item>
            <Card
              className={styles.certificateCard}
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
              <Card.Meta 
                title={course.nome}
              />
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                className={styles.downloadButton}
                onClick={() => handleDownload(course.enrollmentId, course.nome)}
                loading={downloading === course.enrollmentId}
              >
                Baixar PDF
              </Button>
            </Card>
          </List.Item>
        )}
        locale={{
          emptyText: <Empty description="Nenhum certificado disponível com esse nome." />,
        }}
      />
    </div>
  );
}