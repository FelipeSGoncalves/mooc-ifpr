import type { ThemeConfig } from 'antd';


export const themeIFPR: ThemeConfig = {
token: {
colorPrimary: '#198754', // verde institucional
colorSuccess: '#198754',
colorInfo: '#0d6efd',
colorWarning: '#ffc107',
colorError: '#dc3545',
borderRadius: 8,
fontSize: 14,
},
components: {
Button: { controlHeight: 40 },
Card: { headerHeight: 52 },
},
};