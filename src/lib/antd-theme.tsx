import type { ThemeConfig } from "antd";

export const themeIFPR: ThemeConfig = {
  token: {
    colorPrimary: "#038A71",
    colorText: "#001205",
    colorBgContainer: "#FFFFFF",
    colorBorder: "#038A71",
    borderRadius: 10,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  components: {
    Button: {
      // Estilos de botão (sem alteração)
      defaultColor: "#001205",
      defaultBorderColor: "#001205",
      defaultHoverColor: "#038A71",
      defaultHoverBorderColor: "#038A71",
      colorPrimary: "#038A71",
      colorText: "#001205",
      colorPrimaryHover: "#1A4032",
    },
    Layout: {
      bodyBg: "#F2F2F2",
      // --- CORREÇÃO APLICADA AQUI ---
      headerBg: "#212529", // Cinza-escuro
      footerBg: "transparent", // Cinza-escuro
    },
  },
};