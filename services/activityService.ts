// 活动日志服务 - 封装活动日志表操作
import { supabase } from './supabaseClient';
import type { Activity } from '../types';

// 数据库行类型
interface ActivityRow {
    id: string;
    type: 'in' | 'out' | 'move';
    title: string;
    description: string;
    icon: string;
    color_class: string;
    user_id: string;
    created_at: string;
}

// 时间格式化：将数据库时间戳转换为友好描述
function formatTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return '刚刚';
    if (diffMin < 60) return `${diffMin}分钟前`;
    if (diffHour < 24) return `${diffHour}小时前`;
    if (diffDay < 7) return `${diffDay}天前`;
    return date.toLocaleDateString('zh-CN');
}

function rowToActivity(row: ActivityRow): Activity {
    return {
        id: row.id,
        type: row.type,
        title: row.title,
        description: row.description,
        icon: row.icon,
        colorClass: row.color_class,
        time: formatTimeAgo(row.created_at),
    };
}

// 获取活动日志（默认最近 50 条）
export async function getActivities(limit: number = 50): Promise<Activity[]> {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return (data || []).map(rowToActivity);
}

// 记录新活动
export async function addActivity(
    type: 'in' | 'out' | 'move',
    title: string,
    description: string
): Promise<Activity> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const icon = type === 'in' ? 'add_shopping_cart' : type === 'out' ? 'local_shipping' : 'warehouse';
    const colorClass = type === 'in'
        ? 'bg-blue-50 text-blue-500'
        : type === 'out'
            ? 'bg-orange-50 text-orange-500'
            : 'bg-purple-50 text-purple-500';

    const { data, error } = await supabase
        .from('activities')
        .insert({
            type,
            title,
            description,
            icon,
            color_class: colorClass,
            user_id: user.id,
        })
        .select()
        .single();

    if (error) throw error;
    return rowToActivity(data);
}
