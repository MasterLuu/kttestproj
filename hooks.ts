// 自定义 Hooks - 封装数据获取和状态管理
import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Category, Product, Activity } from './types';
import * as authService from './services/authService';
import * as categoryService from './services/categoryService';
import * as productService from './services/productService';
import * as activityService from './services/activityService';

// ============================================
// 认证 Hook
// ============================================
export function useAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 获取初始会话
        authService.getSession().then((s) => {
            setSession(s);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });

        // 监听认证状态变化
        const subscription = authService.onAuthStateChange((s) => {
            setSession(s);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        const result = await authService.signIn(email, password);
        return result;
    }, []);

    const signUp = useCallback(async (email: string, password: string) => {
        const result = await authService.signUp(email, password);
        return result;
    }, []);

    const signOut = useCallback(async () => {
        await authService.signOut();
        setSession(null);
    }, []);

    return {
        session,
        user: session?.user ?? null,
        isLoggedIn: !!session,
        loading,
        signIn,
        signUp,
        signOut,
    };
}

// ============================================
// 分类 Hook
// ============================================
export function useCategories(isLoggedIn: boolean) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchCategories = useCallback(async () => {
        if (!isLoggedIn) return;
        setLoading(true);
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (err) {
            console.error('获取分类失败:', err);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = useCallback(async (name: string) => {
        try {
            const newCat = await categoryService.addCategory(name);
            setCategories(prev => [...prev, newCat]);
            return newCat;
        } catch (err) {
            console.error('新增分类失败:', err);
            throw err;
        }
    }, []);

    const updateCategory = useCallback(async (id: string, name: string) => {
        try {
            const updated = await categoryService.updateCategory(id, name);
            setCategories(prev => prev.map(c => c.id === id ? updated : c));
            return updated;
        } catch (err) {
            console.error('更新分类失败:', err);
            throw err;
        }
    }, []);

    return { categories, loading, addCategory, updateCategory, refetch: fetchCategories };
}

// ============================================
// 商品 Hook
// ============================================
export function useProducts(isLoggedIn: boolean) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProducts = useCallback(async () => {
        if (!isLoggedIn) return;
        setLoading(true);
        try {
            const data = await productService.getProducts();
            setProducts(data);
        } catch (err) {
            console.error('获取商品失败:', err);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const saveProduct = useCallback(async (product: Product) => {
        try {
            // 判断是新增还是更新
            const exists = products.find(p => p.id === product.id);
            let saved: Product;

            if (exists) {
                saved = await productService.updateProduct(product.id, product);
                setProducts(prev => prev.map(p => p.id === product.id ? saved : p));
            } else {
                saved = await productService.addProduct(product);
                setProducts(prev => [saved, ...prev]);
            }
            return { saved, isNew: !exists, oldProduct: exists };
        } catch (err) {
            console.error('保存商品失败:', err);
            throw err;
        }
    }, [products]);

    const updateProduct = useCallback(async (product: Product) => {
        try {
            const saved = await productService.updateProduct(product.id, product);
            setProducts(prev => prev.map(p => p.id === product.id ? saved : p));
            return saved;
        } catch (err) {
            console.error('更新商品失败:', err);
            throw err;
        }
    }, []);

    return { products, loading, saveProduct, updateProduct, refetch: fetchProducts };
}

// ============================================
// 活动日志 Hook
// ============================================
export function useActivities(isLoggedIn: boolean) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchActivities = useCallback(async () => {
        if (!isLoggedIn) return;
        setLoading(true);
        try {
            const data = await activityService.getActivities();
            setActivities(data);
        } catch (err) {
            console.error('获取活动日志失败:', err);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const addActivity = useCallback(async (
        type: 'in' | 'out' | 'move',
        title: string,
        description: string
    ) => {
        try {
            const newAct = await activityService.addActivity(type, title, description);
            setActivities(prev => [newAct, ...prev]);
            return newAct;
        } catch (err) {
            console.error('记录活动失败:', err);
            throw err;
        }
    }, []);

    return { activities, loading, addActivity, refetch: fetchActivities };
}
