// src/app/(protected)/criar-curso/page.tsx
"use client";

import {
  Button,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Typography,
  Upload,
  message,
  Row,
  Col,
  Space,
} from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./CriarCurso.module.css";

const { Title } = Typography;
const { Dragger } = Upload;

export default function CriarCursoPage() {
  const [form] = Form.useForm();
  const router = useRouter();

  // ... (nenhuma mudança nas funções onFinish, onFinishFailed, etc.)
  const onFinish = (values: any) => {
    console.log("Valores do formulário recebidos: ", values);
    message.success("Curso criado com sucesso! (Simulação)");
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Falha ao enviar o formulário:", errorInfo);
    message.error("Por favor, preencha todos os campos obrigatórios.");
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    action: "https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188",
    onChange(info: any) {
      const { status } = info.file;
      if (status === "done") {
        message.success(`${info.file.name} arquivo enviado com sucesso.`);
      } else if (status === "error") {
        message.error(`Falha no envio do arquivo ${info.file.name}.`);
      }
    },
  };

  return (
    // Adicione esta div container envolvendo todo o conteúdo
    <div className={styles.container}>
      <div className={styles.header}>
        <Link
          href="/dashboard"
          passHref
        >
          <Button icon={<ArrowLeftOutlined />}>Voltar</Button>
        </Link>
        <Title
          level={2}
          className={styles.title}
        >
          Criar Curso
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{
          visivel: true,
        }}
      >
        {/* Nenhuma mudança dentro do <Form> */}
        <Row gutter={24}>
          <Col
            xs={24}
            md={12}
          >
            <Form.Item
              name="titulo"
              label="Título do Curso"
              rules={[
                {
                  required: true,
                  message: "Por favor, insira o título do curso!",
                },
              ]}
            >
              <Input placeholder="Ex: Introdução ao React" />
            </Form.Item>
          </Col>
          <Col
            xs={12}
            md={6}
          >
            <Form.Item
              name="visivel"
              label="Curso visível?"
              rules={[{ required: true, message: "Selecione a visibilidade!" }]}
            >
              <Radio.Group>
                <Radio.Button value={true}>Sim</Radio.Button>
                <Radio.Button value={false}>Não</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col
            xs={12}
            md={6}
          >
            <Form.Item
              name="cargaHoraria"
              label="Carga Horária"
              rules={[
                {
                  required: true,
                  message: "Por favor, insira a carga horária!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Ex: 40"
                addonAfter="horas"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="descricao"
          label="Descrição"
          rules={[
            {
              required: true,
              message: "Por favor, insira a descrição do curso!",
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Descreva os objetivos e o conteúdo do curso."
          />
        </Form.Item>

        <Row gutter={24}>
          <Col
            xs={24}
            md={12}
          >
            <Form.Item
              name="nomeProfessor"
              label="Nome do Professor"
              rules={[
                {
                  required: true,
                  message: "Por favor, insira o nome do professor!",
                },
              ]}
            >
              <Input placeholder="Ex: Prof. Dr. João da Silva" />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={12}
          >
            <Form.Item
              name="areaConhecimento"
              label="Área do Curso"
              rules={[
                {
                  required: true,
                  message: "Por favor, selecione a área do curso!",
                },
              ]}
            >
              <Select placeholder="Selecione uma área">
                <Select.Option value="informatica">Informática</Select.Option>
                <Select.Option value="administracao">
                  Administração
                </Select.Option>
                <Select.Option value="letras">Letras</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="thumbnail"
          label="Thumbnail"
          rules={[
            { required: true, message: "Por favor, envie uma thumbnail!" },
          ]}
        >
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              Clique ou arraste um arquivo para esta área para fazer o upload
            </p>
            <p className="ant-upload-hint">
              Suporte para um único upload. Imagens como .png, .jpg, .jpeg são
              recomendadas.
            </p>
          </Dragger>
        </Form.Item>

        <Form.Item className={styles.formActions}>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
            >
              Criar
            </Button>
            <Button
              size="large"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}