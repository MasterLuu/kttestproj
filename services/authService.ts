// 认证服务 - 封装 Supabase Auth 操作
import { supabase } from './supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
    user: User | null;
    session: Session | null;
}

// 邮箱密码登录
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

// 邮箱密码注册
export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) throw error;

    // 注册成功后为新用户初始化默认分类
    if (data.user) {
        await seedDefaultCategories(data.user.id);
    }

    return data;
}

// 登出
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// 获取当前会话
export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

// 获取当前用户
export async function getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
}

// 监听认证状态变化
export function onAuthStateChange(callback: (session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
            callback(session);
        }
    );
    return subscription;
}

// 为新用户初始化默认分类（调用数据库函数）
async function seedDefaultCategories(userId: string) {
    const { error } = await supabase.rpc('seed_default_categories', {
        target_user_id: userId,
    });
    if (error) {
        console.error('初始化默认分类失败:', error);
    }
}
