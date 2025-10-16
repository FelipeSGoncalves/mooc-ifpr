"use client";

import { InboxOutlined } from "@ant-design/icons";
import { Button, Card, Descriptions, Typography, Upload, message } from "antd";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import { useMemo, useState } from "react";

import ImageContainer from "@/components/imageContainer/ImageContainer";

import styles from "./page.module.css";

const { Dragger } = Upload;

const certificateInfo = {
  aluno: "Artur Henrique",
  curso: "Primeiros passos com Python",
  cargaHoraria: "40 horas",
  dataInicio: "10/09/2023",
  dataConclusao: "12/11/2023 - 12:32",
};

export default function VerificarCertificado() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const draggerProps: UploadProps = useMemo(
    () => ({
      name: "certificado",
      multiple: false,
      accept: ".pdf,.png,.jpg,.jpeg",
      fileList,
      beforeUpload: () => false,
      onChange(info) {
        setFileList(info.fileList.slice(-1));
        setIsVerified(false);
      },
      onRemove() {
        setFileList([]);
        setIsVerified(false);
        return true;
      },
    }),
    [fileList],
  );

  const handleVerify = async () => {
    if (!fileList.length) {
      message.warning("Selecione ou arraste o arquivo do certificado antes de verificar.");
      return;
    }

    try {
      setIsVerifying(true);
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      setIsVerified(true);
      message.success("Certificado validado com sucesso!");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <aside className={styles.hero}>
          <div className={styles.heroCard}>
            <ImageContainer />
          </div>
        </aside>

        <Card
          className={styles.card}
          title={<span className={styles.cardTitle}>Verificação de Certificado</span>}
          bodyStyle={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          <Typography.Paragraph className={styles.instructions}>
            Envie o arquivo do certificado ou arraste-o para a área abaixo. Após a verificação,
            apresentaremos as informações oficiais emitidas pela plataforma.
          </Typography.Paragraph>

          <Dragger {...draggerProps} className={styles.dragger}>
            <p className={styles.dragIcon}>
              <InboxOutlined />
            </p>
            <p className={styles.dragTitle}>Arraste o certificado para esta área</p>
            <p className={styles.dragHint}>ou clique para localizar um arquivo no seu dispositivo</p>
          </Dragger>

          <Button
            type="primary"
            size="large"
            block
            className={styles.verifyButton}
            onClick={handleVerify}
            loading={isVerifying}
          >
            Verificar
          </Button>

          {isVerified && (
            <div className={styles.result}>
              <Typography.Text className={styles.status}>
                Certificado Válido!
              </Typography.Text>
              <Descriptions
                column={1}
                colon={false}
                className={styles.descriptions}
                items={[
                  { key: "aluno", label: "Aluno", children: certificateInfo.aluno },
                  { key: "curso", label: "Curso", children: certificateInfo.curso },
                  { key: "carga", label: "Carga horária", children: certificateInfo.cargaHoraria },
                  { key: "inicio", label: "Data de início", children: certificateInfo.dataInicio },
                  { key: "fim", label: "Data de conclusão", children: certificateInfo.dataConclusao },
                ]}
              />
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
