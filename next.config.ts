import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Adicione esta configuração de imagens:
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/mooc/courses/**", // Permite qualquer imagem dentro da rota de cursos
      },
    ],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
};



export default nextConfig;