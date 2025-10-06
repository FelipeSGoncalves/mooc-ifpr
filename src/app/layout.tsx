import { ConfigProvider, App as AntApp } from "antd";
import { themeIFPR } from "@/lib/antd-theme";
import "./global.css";
import AntdRegistry from "@/lib/antd-registry";

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
            <AntApp>{children}</AntApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
