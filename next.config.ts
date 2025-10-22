import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Adicione esta configuração de imagens:
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/mooc/courses/**", // Permite qualquer imagem dentro da rota de cursos
      },
    ],
  },
};

export default nextConfig;