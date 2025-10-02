import { ConfigProvider, App as AntApp } from "antd";
// import { themeIFPR } from "@/lib/antd-theme";
import "./globals.css";
// import AppHeader from "@/components/layout/AppHeader";
// import AppFooter from "@/components/layout/AppFooter";
// import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ConfigProvider>
          <AntApp>{children}</AntApp>
        </ConfigProvider>
      </body>
    </html>
  );
}
