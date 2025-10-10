"use client";
import { Row, Col } from "antd";
import ImageContainer from "@/components/imageContainer/ImageContainer";

export default function AuthLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <Row gutter={10}>
         <Col span={12}><ImageContainer/></Col>
         <Col span={12}>{children}</Col>
      </Row>
   );
}