"use client";

import { Layout, Row, Col, Typography, Space } from "antd";
import Image from "next/image";
import Link from "next/link";
import styles from "./FooterPublic.module.css";
import logoIcon from "./../../../assets/logo_mooc.png";

const { Paragraph, Title } = Typography;

export default function FooterPublic() {
  return (
    <Layout.Footer className={styles.footer}>
      <div className={styles.container}>
        <Row gutter={[48, 40]} justify="space-between">
          <Col xs={24} lg={8}>
            <div className={styles.brandInfo}>
              <Image src={logoIcon} alt="MOOC IFPR" width={150} height={150} />
            </div>
            <Paragraph className={styles.description} style={{color: '#b8b8b8ff', fontSize: '17px'}}>
              Plataforma de Cursos Abertos, Online e Massivos do Instituto Federal do Paraná, Campus Foz do Iguaçu.
            </Paragraph>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Title level={5} className={styles.footerTitle}>Navegação</Title>
            <Space direction="vertical" size="middle">
              <Link href="/catalogo" className={styles.footerLink}>Cursos</Link>
              <Link href="/verificar-certificado" className={styles.footerLink}>Verificar Certificado</Link>
              <Link href="/auth/login" className={styles.footerLink}>Entrar</Link>
            </Space>
          </Col>
          <Col xs={12} sm={8} lg={6}>
            <Title level={5} className={styles.footerTitle}>Contato</Title>
            <Paragraph className={styles.description} style={{marginBottom: 16, color: '#b8b8b8ff'}}>
              Av. Araucária, 780 - Vila A<br/>
              Foz do Iguaçu - PR, 85860-000
            </Paragraph>
            <a href="https://foz.ifpr.edu.br/" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
              Site do Campus
            </a>
          </Col>
        </Row>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} IFPR – Todos os direitos reservados.
        </div>
      </div>
    </Layout.Footer>
  );
}