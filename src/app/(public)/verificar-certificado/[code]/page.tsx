"use client";

import { useState, useEffect } from "react";
import { Typography, Spin, Card, Descriptions, Button, Result, App } from "antd";
import { CheckCircleFilled, CloseCircleFilled, ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";

// Reutilizando estilos e tipos
import styles from "../page.module.css"; // Importa o CSS da página pai
import { validateCertificateByLink, ValidationResponse } from "@/services/certificateService";
import { ApiError } from "@/services/api";

const { Title, Text } = Typography;

export default function ValidarCertificadoPorLink() {
  // useParams pega o valor que está na URL (o nome da pasta é [code])
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    const validate = async () => {
      try {
        const data = await validateCertificateByLink(code);
        setResult(data);
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : "Erro ao validar certificado.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, [code]);

  if (loading) {
    return (
      <div className={styles.wrapper} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Validando autenticidade do certificado..." />
      </div>
    );
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <Link href="/verificar-certificado">
            <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
                Verificar outro
            </Button>
        </Link>

        {error || (result && !result.isValid) ? (
           <Card>
             <Result
                status="error"
                title="Certificado Inválido ou Não Encontrado"
                subTitle={error || result?.message}
                extra={[
                    <Link key="home" href="/">
                        <Button type="primary">Voltar ao Início</Button>
                    </Link>
                ]}
             />
           </Card>
        ) : result && result.isValid ? (
          <div className={styles.result}>
             <div className={`${styles.status} ${styles.valid}`}>
                <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                  <CheckCircleFilled /> Certificado Válido e Autêntico
                </Title>
             </div>
             
             <Card title="Detalhes do Registro" bordered={false}>
                <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} layout="vertical">
                  <Descriptions.Item label="Aluno">{result.studentName}</Descriptions.Item>
                  <Descriptions.Item label="CPF">{result.studentCpf}</Descriptions.Item>
                  <Descriptions.Item label="Curso">{result.courseName}</Descriptions.Item>
                  <Descriptions.Item label="Carga Horária">{result.workload} horas</Descriptions.Item>
                  <Descriptions.Item label="Campus">{result.campusName}</Descriptions.Item>
                  <Descriptions.Item label="Conclusão">
                    {dayjs(result.completionDate).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Código de Validação" span={2}>
                     <Text code copyable>{code}</Text>
                  </Descriptions.Item>
                </Descriptions>
             </Card>
          </div>
        ) : null}
      </div>
    </section>
  );
}