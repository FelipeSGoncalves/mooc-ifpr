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

// Atualizamos a importação para usar a nova função e tipo
import { getCoursesWithCertificateStatus, CompletedCourse } from "@/services/enrollmentService";
import { generateCertificate } from "@/services/certificateService";
import { ApiError } from "@/services/api";
import fallbackImage from "@/assets/thumbnailInformaticaDoZero.png";

const { Title } = Typography;
const { Search } = Input;

export default function CertificadosPage() {
  const { message } = App.useApp();
  // Tipagem atualizada para o novo DTO
  const [allCompletedCourses, setAllCompletedCourses] = useState<CompletedCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CompletedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCompletedCourses = async () => {
      setLoading(true);
      try {
        // Chamamos a nova função passando o status 'aprovado'
        const data = await getCoursesWithCertificateStatus('aprovado');
        setAllCompletedCourses(data.conteudo || []);
        setFilteredCourses(data.conteudo || []);
      } catch {
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
                  // Atenção: Usando 'minuatura' conforme vem do backend (typo)
                  src={course.minuatura || fallbackImage}
                  width={300}
                  height={170}
                  style={{ objectFit: "cover" }}
                />
              }
            >
              <Card.Meta 
                title={course.nome}
                description={`${course.cargaHoraria} horas • Concluído`}
              />
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                className={styles.downloadButton}
                onClick={() => handleDownload(course.enrollmentId, course.nome)}
                loading={downloading === course.enrollmentId}
                style={{ marginTop: 16 }}
              >
                Baixar PDF
              </Button>
            </Card>
          </List.Item>
        )}
        locale={{
          emptyText: <Empty description="Você ainda não possui certificados aprovados." />,
        }}
      />
    </div>
  );
}