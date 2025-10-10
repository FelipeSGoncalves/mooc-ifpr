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
      //Botão Default
      defaultColor: "#001205",
      defaultBorderColor: "#001205",
      defaultHoverColor: "#038A71",
      defaultHoverBorderColor: "#038A71",

      //Botão Primário
      colorPrimary: "#038A71",
      colorText: "#001205",
      colorPrimaryHover: "#1A4032",

      //BOTÃO PERIGO

      //BOTÃO DESATIVADO
    },
    Layout: {
      bodyBg: "#F2F2F2",
      headerBg: "#001205",
      footerBg: "#001205",
    },
  },
};
