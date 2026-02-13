
export enum Screen {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  CATEGORY_LIST = 'CATEGORY_LIST',
  PRODUCT_LIST = 'PRODUCT_LIST',
  ADD_PRODUCT = 'ADD_PRODUCT',
  SETTINGS = 'SETTINGS',
  SCAN_INVENTORY = 'SCAN_INVENTORY',
  REPORTS = 'REPORTS'
}

export interface Category {
  id: string;
  name: string;
  count: number;
  icon: string;
  colorClass: string;
  bgColorClass: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  cost: number;
  price: number;
  stock: number;
  category: string;
  image: string;
  spec?: string;
  status?: 'low' | 'normal' | 'warning';
}

export interface Activity {
  id: string;
  type: 'in' | 'out' | 'move';
  title: string;
  time: string;
  description: string;
  icon: string;
  colorClass: string;
}
