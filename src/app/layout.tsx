"use client";

import { ConfigProvider, App } from "antd";
import AntdRegistry from "@/lib/antd-registry";
import { themeIFPR } from "@/lib/antd-theme";
import { AuthProvider } from "@/hooks/useAuth";
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
          <App>
            <ConfigProvider theme={themeIFPR}>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ConfigProvider>
          </App>
        </AntdRegistry>
      </body>
    </html>
  );
}