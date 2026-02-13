// 分类服务 - 封装分类表的 CRUD 操作
import { supabase } from './supabaseClient';
import type { Category } from '../types';

// 数据库行类型 → 前端 Category 类型的映射
interface CategoryRow {
    id: string;
    name: string;
    icon: string;
    color_class: string;
    bg_color_class: string;
    user_id: string;
    created_at: string;
}

function rowToCategory(row: CategoryRow): Category {
    return {
        id: row.id,
        name: row.name,
        icon: row.icon,
        colorClass: row.color_class,
        bgColorClass: row.bg_color_class,
        count: 0, // 前端动态计算
    };
}

// 获取所有分类
export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(rowToCategory);
}

// 新增分类
export async function addCategory(
    name: string,
    icon: string = 'category',
    colorClass: string = 'text-primary',
    bgColorClass: string = 'bg-primary/5'
): Promise<Category> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const { data, error } = await supabase
        .from('categories')
        .insert({
            name,
            icon,
            color_class: colorClass,
            bg_color_class: bgColorClass,
            user_id: user.id,
        })
        .select()
        .single();

    if (error) throw error;
    return rowToCategory(data);
}

// 更新分类名称
export async function updateCategory(id: string, name: string): Promise<Category> {
    const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return rowToCategory(data);
}

// 删除分类
export async function deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
