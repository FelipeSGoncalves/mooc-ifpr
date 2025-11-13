"use client";

import { InboxOutlined, CheckCircleFilled, CloseCircleFilled, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Descriptions, Typography, Upload, App, Input, Tabs, Space } from "antd";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { useState } from "react";
import dayjs from "dayjs";
import styles from "./page.module.css";

import { validateCertificateByPdf, validateCertificateByCode, ValidationResponse } from "@/services/certificateService";
import { ApiError } from "@/services/api";

const { Dragger } = Upload;
const { Title, Paragraph, Text } = Typography;

export default function VerificarCertificado() {
  const { message } = App.useApp();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  const handleReset = () => {
    setIsVerifying(false);
    setValidationResult(null);
    setFileList([]);
    setVerificationCode("");
  };
  

  const handleVerifyByFile = async () => {
    if (fileList.length === 0) {
      message.warning("Por favor, selecione um arquivo PDF para verificar.");
      return;
    }

    setIsVerifying(true);
    setValidationResult(null);

    try {
      // Acessamos o arquivo diretamente de fileList[0]
      const file = fileList[0] as RcFile; 
      const result = await validateCertificateByPdf(file);
      setValidationResult(result);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Erro ao processar o arquivo.";
      setValidationResult({ isValid: false, message: errorMessage });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyByCode = async () => {
    if (!verificationCode.trim()) {
      message.warning("Por favor, insira o código do certificado.");
      return;
    }
    setIsVerifying(true);
    setValidationResult(null);
    try {
      const result = await validateCertificateByCode(verificationCode);
      setValidationResult(result);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Código inválido ou erro na verificação.";
      setValidationResult({ isValid: false, message: errorMessage });
    } finally {
      setIsVerifying(false);
    }
  };


  const draggerProps: UploadProps = {
    name: "certificado",
    multiple: false,
    accept: ".pdf",
    fileList,
    beforeUpload: (file) => {
      setFileList([file]);
      setValidationResult(null);
      return false;
    },
    onRemove: () => handleReset(),
  };

  const renderResult = () => {
    if (!validationResult) return null;

    if (!validationResult.isValid) {
      return (
        <div className={styles.result}>
          <Title level={4} className={`${styles.status} ${styles.invalid}`}>
            <CloseCircleFilled /> Certificado Inválido
          </Title>
          <Text>{validationResult.message}</Text>
        </div>
      );
    }

    return (
      <div className={styles.result}>
        <Title level={4} className={`${styles.status} ${styles.valid}`}>
          <CheckCircleFilled /> Certificado Válido e Autêntico!
        </Title>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Aluno">{validationResult.studentName}</Descriptions.Item>
          <Descriptions.Item label="Curso">{validationResult.courseName}</Descriptions.Item>
          <Descriptions.Item label="Carga Horária">{validationResult.workload} horas</Descriptions.Item>
          <Descriptions.Item label="Campus">{validationResult.campusName}</Descriptions.Item>
          <Descriptions.Item label="Data de Conclusão">
            {dayjs(validationResult.completionDate).format("DD/MM/YYYY")}
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  };
  
  const tabItems = [
    {
      key: '1',
      label: 'Verificar por Arquivo',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Dragger {...draggerProps}><p className="ant-upload-drag-icon"><InboxOutlined /></p><p className="ant-upload-text">Clique ou arraste o arquivo PDF do certificado</p></Dragger>
          <Button type="primary" size="large" block onClick={handleVerifyByFile} loading={isVerifying}>Verificar Arquivo</Button>
        </Space>
      )
    },
    {
      key: '2',
      label: 'Verificar por Código',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input size="large" placeholder="Digite o código de verificação" value={verificationCode} onChange={(e) => { setVerificationCode(e.target.value); setValidationResult(null); }} />
          <Button type="primary" size="large" block icon={<SearchOutlined />} onClick={handleVerifyByCode} loading={isVerifying}>Verificar Código</Button>
        </Space>
      )
    }
  ];

  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <Title level={2}>Verificação de Certificado</Title>
        <Paragraph>
          Utilize uma das opções abaixo para confirmar a autenticidade de um certificado emitido pela nossa plataforma.
        </Paragraph>
        <Card>
            <Tabs defaultActiveKey="1" items={tabItems} onChange={handleReset} />
            {validationResult && <div style={{ marginTop: 24 }}>{renderResult()}</div>}
        </Card>
      </div>
    </section>
  );
}