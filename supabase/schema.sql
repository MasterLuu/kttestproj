-- =============================================
-- SmartInventory Pro - Supabase 数据库初始化脚本
-- 在 Supabase Dashboard SQL Editor 中执行此脚本
-- =============================================

-- 1. 商品分类表
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'category',
  color_class TEXT NOT NULL DEFAULT 'text-primary',
  bg_color_class TEXT NOT NULL DEFAULT 'bg-primary/5',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 商品表
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL DEFAULT '',
  image TEXT DEFAULT '',
  spec TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'low', 'warning')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 操作活动日志表
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'move')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'inventory_2',
  color_class TEXT NOT NULL DEFAULT 'bg-blue-50 text-blue-500',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 启用 Row Level Security (RLS)
-- =============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 分类表 RLS 策略：用户只能操作自己的数据
CREATE POLICY "用户查看自己的分类" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户创建自己的分类" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户更新自己的分类" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用户删除自己的分类" ON categories FOR DELETE USING (auth.uid() = user_id);

-- 商品表 RLS 策略
CREATE POLICY "用户查看自己的商品" ON products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户创建自己的商品" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户更新自己的商品" ON products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用户删除自己的商品" ON products FOR DELETE USING (auth.uid() = user_id);

-- 活动日志表 RLS 策略
CREATE POLICY "用户查看自己的活动" ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户创建自己的活动" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- updated_at 自动更新触发器
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 种子数据函数：为新用户初始化默认分类
-- 可通过 Supabase Edge Function 或手动调用
-- =============================================

CREATE OR REPLACE FUNCTION seed_default_categories(target_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO categories (name, icon, color_class, bg_color_class, user_id) VALUES
    ('电子数码', 'laptop_mac', 'text-blue-500', 'bg-blue-50', target_user_id),
    ('服装服饰', 'checkroom', 'text-orange-500', 'bg-orange-50', target_user_id),
    ('食品饮料', 'flatware', 'text-green-500', 'bg-green-50', target_user_id),
    ('五金工具', 'home_repair_service', 'text-purple-500', 'bg-purple-50', target_user_id),
    ('美妆个护', 'face_retouching_natural', 'text-pink-500', 'bg-pink-50', target_user_id),
    ('其他分类', 'more_horiz', 'text-gray-500', 'bg-gray-50', target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
