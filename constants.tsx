
import { Category, Product, Activity } from './types';

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: '电子数码', count: 248, icon: 'laptop_mac', colorClass: 'text-blue-500', bgColorClass: 'bg-blue-50' },
  { id: '2', name: '服装服饰', count: 1024, icon: 'checkroom', colorClass: 'text-orange-500', bgColorClass: 'bg-orange-50' },
  { id: '3', name: '食品饮料', count: 562, icon: 'flatware', colorClass: 'text-green-500', bgColorClass: 'bg-green-50' },
  { id: '4', name: '五金工具', count: 89, icon: 'home_repair_service', colorClass: 'text-purple-500', bgColorClass: 'bg-purple-50' },
  { id: '5', name: '美妆个护', count: 315, icon: 'face_retouching_natural', colorClass: 'text-pink-500', bgColorClass: 'bg-pink-50' },
  { id: '6', name: '其他分类', count: 42, icon: 'more_horiz', colorClass: 'text-gray-500', bgColorClass: 'bg-gray-50' },
];

export const MOCK_PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    name: '智能电子手表 Pro 系列 2024款', 
    sku: 'SW-PRO-2024-GR', 
    cost: 1800, 
    price: 2499, 
    stock: 5, 
    category: '电子数码', 
    spec: '深空灰 / 44mm', 
    status: 'warning',
    image: 'https://picsum.photos/seed/watch/200/200'
  },
  { 
    id: 'p2', 
    name: '无线蓝牙降噪耳机 H1 高保真', 
    sku: 'AU-H1-WHITE', 
    cost: 850, 
    price: 1288, 
    stock: 128, 
    category: '电子数码', 
    spec: '极昼白 / 无线版', 
    status: 'normal',
    image: 'https://picsum.photos/seed/headphone/200/200'
  },
  { 
    id: 'p3', 
    name: '复古胶片照相机 M-100', 
    sku: 'CAM-M100-35', 
    cost: 3200, 
    price: 4599, 
    stock: 42, 
    category: '电子数码', 
    spec: '标配版 / 含35mm镜头', 
    status: 'normal',
    image: 'https://picsum.photos/seed/camera/200/200'
  },
  { 
    id: 'p4', 
    name: '运动跑鞋 Air Max 极速版', 
    sku: 'SH-AIRMAX-42', 
    cost: 450, 
    price: 899, 
    stock: 12, 
    category: '服装服饰', 
    spec: '亮橙色 / 42码', 
    status: 'low',
    image: 'https://picsum.photos/seed/shoes/200/200'
  }
];

export const MOCK_ACTIVITIES: Activity[] = [
  { id: 'a1', type: 'in', title: '新增入库', time: '2分钟前', description: 'iPhone 15 Pro - 50 台', icon: 'add_shopping_cart', colorClass: 'bg-blue-50 text-blue-500' },
  { id: 'a2', type: 'out', title: '出库发货', time: '1小时前', description: '订单 #5432 已发出', icon: 'local_shipping', colorClass: 'bg-orange-50 text-orange-500' },
  { id: 'a3', type: 'move', title: '移库操作', time: '3小时前', description: '12 件商品移至 B 区', icon: 'warehouse', colorClass: 'bg-purple-50 text-purple-500' },
];
