import { ConfigProvider, App as AntApp } from "antd";
import AntdRegistry from "@/lib/antd-registry";
import { themeIFPR } from "@/lib/antd-theme";
import { AuthProvider } from "@/hooks/useAuth"; // 1. Importartet
import "./global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AntdRegistry>
          <ConfigProvider theme={themeIFPR}>
            {/* 2. Envolver o AntApp com o AuthProvider */}
            <AuthProvider>
              <AntApp>{children}</AntApp>
            </AuthProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
