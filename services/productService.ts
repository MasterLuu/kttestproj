// 商品服务 - 封装商品表的 CRUD 操作
import { supabase } from './supabaseClient';
import type { Product } from '../types';

// 数据库行类型
interface ProductRow {
    id: string;
    name: string;
    sku: string;
    cost: number;
    price: number;
    stock: number;
    category_id: string | null;
    category_name: string;
    image: string;
    spec: string;
    status: 'normal' | 'low' | 'warning';
    user_id: string;
    created_at: string;
    updated_at: string;
}

function rowToProduct(row: ProductRow): Product {
    return {
        id: row.id,
        name: row.name,
        sku: row.sku,
        cost: Number(row.cost),
        price: Number(row.price),
        stock: row.stock,
        category: row.category_name,
        image: row.image || '',
        spec: row.spec || '',
        status: row.status,
    };
}

// 获取所有商品
export async function getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(rowToProduct);
}

// 新增商品
export async function addProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    // 根据分类名查找对应的 category_id
    let categoryId: string | null = null;
    if (product.category) {
        const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .eq('name', product.category)
            .single();
        categoryId = catData?.id || null;
    }

    const { data, error } = await supabase
        .from('products')
        .insert({
            name: product.name,
            sku: product.sku,
            cost: product.cost,
            price: product.price,
            stock: product.stock,
            category_id: categoryId,
            category_name: product.category || '',
            image: product.image || '',
            spec: product.spec || '',
            status: product.status || 'normal',
            user_id: user.id,
        })
        .select()
        .single();

    if (error) throw error;
    return rowToProduct(data);
}

// 更新商品
export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const updateData: Record<string, any> = {};

    if (product.name !== undefined) updateData.name = product.name;
    if (product.sku !== undefined) updateData.sku = product.sku;
    if (product.cost !== undefined) updateData.cost = product.cost;
    if (product.price !== undefined) updateData.price = product.price;
    if (product.stock !== undefined) updateData.stock = product.stock;
    if (product.image !== undefined) updateData.image = product.image;
    if (product.spec !== undefined) updateData.spec = product.spec;
    if (product.status !== undefined) updateData.status = product.status;

    // 如果更新了分类名，同步更新 category_id
    if (product.category !== undefined) {
        updateData.category_name = product.category;
        const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .eq('name', product.category)
            .single();
        updateData.category_id = catData?.id || null;
    }

    const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return rowToProduct(data);
}

// 删除商品
export async function deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
