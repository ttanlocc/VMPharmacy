export const APP_CONFIG = {
    name: 'Pharmacy Fast Order',
    version: '0.1.0',
};

export const COLORS = {
    primary: '#0EA5E9', // Xanh dược phẩm
    secondary: '#64748B',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
};

export const UI_LIMITS = {
    maxImageSize: 200 * 1024, // 200KB
    touchTargetMin: 44, // 44px
};

export const API_ENDPOINTS = {
    drugs: '/api/drugs',
    templates: '/api/templates',
    upload: '/api/upload',
};

export const DRUG_UNITS = ['Viên', 'Vỉ', 'Hộp', 'Chai', 'Ống', 'Gói'];
