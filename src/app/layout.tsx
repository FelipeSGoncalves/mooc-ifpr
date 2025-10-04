// import { ConfigProvider, App as AntApp } from "antd";
// import { themeIFPR } from "@/lib/antd-theme";
// import "./globals.css";

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="pt-BR">
//       <body>
//         <ConfigProvider>
//           <AntApp>{children}</AntApp>
//         </ConfigProvider>
//       </body>
//     </html>
//   );
// }

import { ConfigProvider, App as AntApp } from "antd";
import { themeIFPR } from "@/lib/antd-theme"; // Importe o tema
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {/* O ConfigProvider aplica o tema a todos os componentes Ant Design filhos */}
        <ConfigProvider theme={themeIFPR}>
          <AntApp>{children}</AntApp>
        </ConfigProvider>
      </body>
    </html>
  );
}
