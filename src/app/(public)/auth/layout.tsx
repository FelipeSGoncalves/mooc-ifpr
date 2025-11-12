"use client";

import { Col, Row } from "antd";

import ImageContainer from "@/components/imageContainer/ImageContainer";

import styles from "./layout.module.css";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.wrapper}>
      <Row
        gutter={[32, 32]}
        justify="center"
        align="middle"
        className={styles.row}
      >
        <Col xs={24} lg={12} className={styles.column}>
          <ImageContainer />
        </Col>
        <Col xs={24} lg={12} className={styles.column}>
          {children}
        </Col>
      </Row>
    </div>
  );
}
