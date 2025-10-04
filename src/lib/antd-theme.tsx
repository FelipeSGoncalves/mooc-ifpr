// import type { ThemeConfig } from 'antd';


// export const themeIFPR: ThemeConfig = {
// token: {
// colorPrimary: '#2D3A3A', // verde institucional
// colorSuccess: '#198754',
// colorInfo: '#0d6efd',
// colorWarning: '#ffc107',
// colorError: '#dc3545',
// borderRadius: 8,
// fontSize: 14,
// },
// components: {
// Button: { controlHeight: 40 },
// Card: { headerHeight: 52 },
// },
// };

import type { ThemeConfig } from 'antd';

export const themeIFPR: ThemeConfig = {
  token: {
    // A cor primária afeta botões, links, inputs focados, etc.
    colorPrimary: '#038A71', // O verde "destaque" da sua paleta

    // Cor de texto principal
    colorText: '#0B261C', // O verde mais escuro para textos

    // Arredondamento das bordas
    borderRadius: 8,

    // Fonte padrão
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  components: {
    Button: {
      // Especifica a cor do texto para botões primários
      colorPrimary: '#038A71',
      colorText: '#000000ff', // Texto branco para botões primários
      colorPrimaryHover: '#038A71', // Cor ao passar o mouse
    },
    Layout: {
      // Cor de fundo geral das páginas
      bodyBg: '#F2F2F2',
    },
  },
};