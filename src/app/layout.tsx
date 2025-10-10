import { ConfigProvider, App as AntApp } from "antd";
import AntdRegistry from "@/lib/antd-registry";
import { themeIFPR } from "@/lib/antd-theme";
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
            <AntApp>{children}</AntApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
