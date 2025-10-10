"use client";
import { Row, Col } from "antd";
import Image from "next/image";

export default function AuthLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <Row>
         <Col span={12}>Teste</Col>
         <Col span={12}>{children}</Col>
      </Row>
   );
}