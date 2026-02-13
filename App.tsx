
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Screen, Category, Product, Activity } from './types';
import { MOCK_PRODUCTS } from './constants';
import { getInventoryInsights } from './geminiService';
import { useAuth, useCategories, useProducts, useActivities } from './hooks';

// --- Shared Components ---

const Header: React.FC<{ title: string; showBack?: boolean; onBack?: () => void; rightAction?: React.ReactNode }> = ({ title, showBack, onBack, rightAction }) => (
  <header className="sticky top-0 z-40 bg-white border-b border-van-border ios-safe-top">
    <div className="flex items-center justify-between px-4 h-[46px]">
      <div className="min-w-[80px]">
        {showBack && (
          <button onClick={onBack} className="flex items-center text-primary active:opacity-60">
            <span className="material-icons text-[24px]">chevron_left</span>
            <span className="text-[16px]">返回</span>
          </button>
        )}
      </div>
      <h1 className="text-[16px] font-bold text-center flex-1 truncate px-2">{title}</h1>
      <div className="min-w-[80px] flex justify-end whitespace-nowrap">
        {rightAction}
      </div>
    </div>
  </header>
);

const TabBar: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-van-border ios-safe-bottom z-50">
    <div className="flex items-center justify-around h-[50px]">
      <button onClick={() => onTabChange(Screen.DASHBOARD)} className={`flex flex-col items-center flex-1 ${activeTab === Screen.DASHBOARD ? 'text-primary' : 'text-slate-400'}`}>
        <span className={`material-icons text-2xl ${activeTab === Screen.DASHBOARD ? 'filled-icon' : ''}`}>grid_view</span>
        <span className="text-[10px] mt-0.5">首页</span>
      </button>
      <button onClick={() => onTabChange(Screen.PRODUCT_LIST)} className={`flex flex-col items-center flex-1 ${activeTab === Screen.PRODUCT_LIST ? 'text-primary' : 'text-slate-400'}`}>
        <span className={`material-icons text-2xl ${activeTab === Screen.PRODUCT_LIST ? 'filled-icon' : ''}`}>inventory_2</span>
        <span className="text-[10px] mt-0.5">库存</span>
      </button>
      <div className="relative -top-3">
        <button onClick={() => onTabChange(Screen.ADD_PRODUCT)} className="w-12 h-12 bg-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
          <span className="material-icons text-white">add</span>
        </button>
      </div>
      <button onClick={() => onTabChange(Screen.REPORTS)} className={`flex flex-col items-center flex-1 ${activeTab === Screen.REPORTS ? 'text-primary' : 'text-slate-400'}`}>
        <span className={`material-icons text-2xl ${activeTab === Screen.REPORTS ? 'filled-icon' : ''}`}>bar_chart</span>
        <span className="text-[10px] mt-0.5">报表</span>
      </button>
      <button onClick={() => onTabChange(Screen.SETTINGS)} className={`flex flex-col items-center flex-1 ${activeTab === Screen.SETTINGS ? 'text-primary' : 'text-slate-400'}`}>
        <span className={`material-icons text-2xl ${activeTab === Screen.SETTINGS ? 'filled-icon' : ''}`}>settings</span>
        <span className="text-[10px] mt-0.5">设置</span>
      </button>
    </div>
  </nav>
);

// --- Screen Components ---

const LoginScreen: React.FC<{ onLogin: (email: string, password: string) => Promise<void>; onRegister: (email: string, password: string) => Promise<void> }> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('admin@smartinv.com');
  const [password, setPassword] = useState('password123');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      if (isRegistering) {
        await onRegister(email, password);
      } else {
        await onLogin(email, password);
      }
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-van-bg flex flex-col items-center px-8 pt-16">
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <span className="material-icons text-primary text-4xl">inventory_2</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{isRegistering ? '创建账号' : '欢迎回来'}</h1>
        <p className="text-slate-500 font-medium">{isRegistering ? '注册以开始管理库存' : '登录以管理您的库存'}</p>
      </div>
      <div className="w-full max-w-sm space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <span className="material-icons text-sm">error_outline</span>
            {error}
          </div>
        )}
        <div className="overflow-hidden rounded-xl border border-van-border bg-white shadow-sm">
          <div className="flex items-center px-4 py-3 border-b border-van-border focus-within:border-primary">
            <span className="material-icons text-slate-400 mr-3 text-lg">mail_outline</span>
            <input
              className="flex-1 border-none focus:ring-0 p-0 text-slate-800 placeholder-slate-400"
              placeholder="邮箱地址"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center px-4 py-3 border-none">
            <span className="material-icons text-slate-400 mr-3 text-lg">lock_outline</span>
            <input
              className="flex-1 border-none focus:ring-0 p-0 text-slate-800 placeholder-slate-400"
              placeholder="密码"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button onClick={() => setShowPassword(!showPassword)} className="p-1">
              <span className="material-icons text-slate-400 text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
          {isRegistering ? '注册' : '登录'}
        </button>
        <div className="text-center pt-4">
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="text-primary font-semibold text-sm"
          >
            {isRegistering ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>
      </div>
      <div className="mt-auto pb-12 w-full max-w-sm opacity-50 flex flex-col gap-2">
        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-primary/40 rounded-full"></div>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>企业版</span>
          <span>v4.2.0</span>
        </div>
      </div>
    </div>
  );
};

const DashboardScreen: React.FC<{ onNavigate: (s: Screen) => void, products: Product[], activities: Activity[] }> = ({ onNavigate, products, activities }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchInsights = useCallback(async () => {
    setLoadingInsights(true);
    const summary = `Total Items: ${products.length}, Stock Values: ${products.reduce((acc, p) => acc + p.stock, 0)}`;
    const result = await getInventoryInsights(summary);
    setInsights(result);
    setLoadingInsights(false);
  }, [products]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return (
    <div className="pb-24">
      <Header title="工作台" />
      <main className="px-4 py-4 space-y-5">
        <section>
          <h2 className="text-xl font-bold">库存概览</h2>
          <p className="text-xs text-slate-400 mt-1">欢迎回来，管理员</p>
        </section>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-lg border border-van-border flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mb-2">
              <span className="material-icons text-primary text-lg">inventory_2</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500">商品总数</span>
            <span className="text-lg font-bold">{products.length}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-van-border flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center mb-2">
              <span className="material-icons text-red-500 text-lg">error_outline</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500">库存预警</span>
            <span className="text-lg font-bold text-red-500">{products.filter(p => p.status === 'warning').length}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-van-border flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
              <span className="material-icons text-emerald-500 text-lg">payments</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500">今日销售</span>
            <span className="text-lg font-bold text-emerald-600">¥9.4k</span>
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base">AI 智能分析</h3>
            {loadingInsights && <span className="animate-spin h-3 w-3 border-t-2 border-primary rounded-full"></span>}
          </div>
          <div className="bg-white rounded-lg p-4 border border-van-border shadow-sm space-y-3">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <span className="material-icons text-primary text-sm mt-0.5">auto_awesome</span>
                <p className="text-xs text-slate-600 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">最近动态</h3>
            <button
              onClick={() => onNavigate(Screen.REPORTS)}
              className="text-xs text-primary font-medium active:opacity-60"
            >
              查看全部
            </button>
          </div>
          <div className="bg-white rounded-lg overflow-hidden border border-van-border shadow-sm">
            {activities.length > 0 ? activities.map((act) => (
              <div key={act.id} className="flex items-center p-4 border-b border-van-border last:border-none active:bg-van-bg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${act.colorClass}`}>
                  <span className="material-icons text-[20px]">{act.icon}</span>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium">{act.title}</h4>
                    <span className="text-[10px] text-slate-400">{act.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{act.description}</p>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-xs text-slate-400 font-medium">暂无动态</div>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-bold text-base">快捷操作</h3>
          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => onNavigate(Screen.ADD_PRODUCT)} className="flex flex-col items-center gap-2 active:opacity-60">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-van-border">
                <span className="material-icons text-primary">add_box</span>
              </div>
              <span className="text-[11px] font-medium text-center">新增商品</span>
            </button>
            <button onClick={() => onNavigate(Screen.SCAN_INVENTORY)} className="flex flex-col items-center gap-2 active:opacity-60">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-van-border">
                <span className="material-icons text-primary">qr_code_scanner</span>
              </div>
              <span className="text-[11px] font-medium text-center">扫码盘点</span>
            </button>
            <button onClick={() => onNavigate(Screen.CATEGORY_LIST)} className="flex flex-col items-center gap-2 active:opacity-60">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-van-border">
                <span className="material-icons text-primary">category</span>
              </div>
              <span className="text-[11px] font-medium text-center">品类管理</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

const CategoryListScreen: React.FC<{
  categories: Category[];
  onAddCategory: (name: string) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onBack: () => void;
}> = ({ categories, onAddCategory, onUpdateCategory, onBack }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState('');
  const [editName, setEditName] = useState('');

  const handleAddConfirm = () => {
    if (newName.trim()) {
      onAddCategory(newName.trim());
      setNewName('');
      setShowAddModal(false);
    }
  };

  const handleEditConfirm = () => {
    if (editingCategory && editName.trim()) {
      onUpdateCategory(editingCategory.id, editName.trim());
      setEditingCategory(null);
      setEditName('');
    }
  };

  return (
    <div className="bg-van-bg min-h-screen">
      <Header
        title="商品类别"
        showBack
        onBack={onBack}
        rightAction={
          <button onClick={() => setShowAddModal(true)} className="flex items-center text-primary text-[14px]">
            <span className="material-icons text-[20px] mr-0.5">add</span>
            <span>新增分类</span>
          </button>
        }
      />
      <main className="py-3">
        <div className="px-4 mb-2 text-van-secondary text-xs uppercase tracking-wider">全部分类</div>
        <div className="bg-white border-y border-van-border">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => { setEditingCategory(cat); setEditName(cat.name); }}
              className="flex items-center px-4 py-3 border-b border-van-border last:border-none active:bg-van-bg cursor-pointer transition-colors"
            >
              <div className={`w-10 h-10 ${cat.bgColorClass} rounded-lg flex items-center justify-center mr-3`}>
                <span className={`material-symbols-outlined ${cat.colorClass}`}>{cat.icon}</span>
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-medium">{cat.name}</div>
              </div>
              <span className="material-symbols-outlined text-van-secondary text-[20px]">chevron_right</span>
            </div>
          ))}
        </div>
        <div className="p-8 text-center text-van-secondary text-sm">
          共 {categories.length} 个主分类
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-8 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl">
            <div className="px-6 pt-6 pb-4">
              <h3 className="text-center text-lg font-bold mb-4">新增分类</h3>
              <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
                <label className="block text-xs font-bold text-slate-400 mb-1">分类名称</label>
                <input
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-primary font-medium placeholder-slate-300 text-sm"
                  placeholder="请输入分类名称"
                  type="text"
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddConfirm()}
                />
              </div>
              <p className="text-xs text-slate-400 mt-4 px-1 text-center leading-relaxed">
                合理的分类有助于更好的库存统计与追踪
              </p>
            </div>
            <div className="flex border-t border-slate-100 mt-2">
              <button onClick={() => { setShowAddModal(false); setNewName(''); }} className="flex-1 py-4 text-slate-500 font-medium active:bg-slate-50 text-base">取消</button>
              <div className="w-[1px] bg-slate-100"></div>
              <button onClick={handleAddConfirm} className="flex-1 py-4 text-primary font-bold active:bg-slate-50 text-base">确认</button>
            </div>
          </div>
        </div>
      )}

      {editingCategory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-8 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl">
            <div className="px-6 pt-6 pb-4">
              <h3 className="text-center text-lg font-bold mb-4">修改分类名称</h3>
              <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
                <label className="block text-xs font-bold text-slate-400 mb-1">分类名称</label>
                <input
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-primary font-medium placeholder-slate-300 text-sm"
                  placeholder="请输入新的分类名称"
                  type="text"
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEditConfirm()}
                />
              </div>
              <p className="text-xs text-slate-400 mt-4 px-1 text-center leading-relaxed">
                修改名称不会影响该分类下的商品数据
              </p>
            </div>
            <div className="flex border-t border-slate-100 mt-2">
              <button onClick={() => { setEditingCategory(null); setEditName(''); }} className="flex-1 py-4 text-slate-500 font-medium active:bg-slate-50 text-base">取消</button>
              <div className="w-[1px] bg-slate-100"></div>
              <button onClick={handleEditConfirm} className="flex-1 py-4 text-primary font-bold active:bg-slate-50 text-base">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductListScreen: React.FC<{
  onEditProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  categories: Category[];
  products: Product[];
}> = ({ onEditProduct, onUpdateProduct, categories, products }) => {
  const [outboundProduct, setOutboundProduct] = useState<Product | null>(null);
  const [outboundCount, setOutboundCount] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部分类');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === '全部分类' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (sortOrder === 'asc') {
    filteredProducts.sort((a, b) => a.stock - b.stock);
  } else if (sortOrder === 'desc') {
    filteredProducts.sort((a, b) => b.stock - a.stock);
  }

  const handleToggleSort = () => {
    if (sortOrder === null) setSortOrder('asc');
    else if (sortOrder === 'asc') setSortOrder('desc');
    else setSortOrder(null);
  };

  const handleOutboundConfirm = () => {
    if (outboundProduct) {
      const newStock = Math.max(0, outboundProduct.stock - outboundCount);
      const newStatus = newStock <= 5 ? 'warning' : newStock <= 20 ? 'low' : 'normal';

      onUpdateProduct({
        ...outboundProduct,
        stock: newStock,
        status: newStatus as any
      });

      setOutboundProduct(null);
      setOutboundCount(1);
    }
  };

  return (
    <div className="pb-24 bg-van-bg min-h-screen">
      <div className="sticky top-0 z-40 bg-white ios-safe-top shadow-sm">
        <div className="px-3 py-2.5">
          <div className="flex items-center bg-van-bg rounded px-3 py-2 h-9">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-[14px] flex-1 px-2 h-full placeholder-slate-400"
              placeholder="请输入商品名称或编码"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex border-b border-van-border h-[48px] relative">
          <button
            onClick={() => setShowCategoryPicker(true)}
            className="flex-1 flex items-center justify-center text-[14px] text-van-text active:bg-van-bg transition-colors"
          >
            <span className="truncate max-w-[100px]">{selectedCategory}</span>
            <span className="material-symbols-outlined text-[16px] ml-0.5 text-slate-400">arrow_drop_down</span>
          </button>
          <button
            onClick={handleToggleSort}
            className={`flex-1 flex items-center justify-center text-[14px] transition-colors active:bg-van-bg border-l border-van-border ${sortOrder ? 'text-primary font-bold' : 'text-van-text'}`}
          >
            <span>库存排序</span>
            <span className={`material-symbols-outlined text-[18px] ml-1 ${sortOrder ? 'text-primary' : 'text-slate-400'}`}>
              {sortOrder === 'asc' ? 'arrow_upward' : sortOrder === 'desc' ? 'arrow_downward' : 'swap_vert'}
            </span>
          </button>

          {showCategoryPicker && (
            <>
              <div className="fixed inset-0 bg-black/20 z-10" onClick={() => setShowCategoryPicker(false)}></div>
              <div className="absolute top-[48px] left-0 w-full bg-white z-20 shadow-xl max-h-[300px] overflow-y-auto animate-[slideDown_0.2s_ease-out]">
                <button
                  onClick={() => { setSelectedCategory('全部分类'); setShowCategoryPicker(false); }}
                  className={`w-full text-left px-5 py-3 text-sm border-b border-van-border last:border-none ${selectedCategory === '全部分类' ? 'text-primary bg-primary/5 font-bold' : ''}`}
                >
                  全部分类
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.name); setShowCategoryPicker(false); }}
                    className={`w-full text-left px-5 py-3 text-sm border-b border-van-border last:border-none ${selectedCategory === cat.name ? 'text-primary bg-primary/5 font-bold' : ''}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <main>
        {filteredProducts.length > 0 ? filteredProducts.map((prod) => (
          <div
            key={prod.id}
            onClick={() => onEditProduct(prod)}
            className="bg-white px-4 py-2 mt-2 flex shadow-sm first:mt-0 active:bg-van-bg transition-colors cursor-pointer"
          >
            <div className="w-24 h-24 rounded-lg bg-slate-100 flex-shrink-0 mr-3 overflow-hidden border border-van-border">
              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between py-0.5">
              <div>
                <h3 className="text-[14px] font-bold leading-tight line-clamp-2">{prod.name}</h3>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-1.5 rounded text-[10px] font-bold text-white shadow-sm ${prod.status === 'warning' ? 'bg-danger' : prod.status === 'low' ? 'bg-warning' : 'bg-success'}`}>
                  {prod.status === 'warning' ? '库存预警' : prod.status === 'low' ? '库存偏低' : '库存充足'}
                </span>
                <span className="text-[12px] text-slate-500">当前库存: <span className={`font-bold ${prod.status === 'warning' ? 'text-danger' : prod.status === 'low' ? 'text-warning' : 'text-slate-800'}`}>{prod.stock} 件</span></span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-danger text-[16px] font-black">¥{prod.price.toLocaleString()}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOutboundProduct(prod);
                    setOutboundCount(1);
                  }}
                  className="bg-primary text-white text-[11px] font-bold py-1.5 px-5 rounded-lg shadow-md active:scale-95 transition-transform"
                >
                  出库
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <span className="material-icons text-6xl opacity-20">inventory_2</span>
            <p className="mt-4 text-sm font-medium">未找到匹配商品</p>
          </div>
        )}
      </main>

      {outboundProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOutboundProduct(null)}></div>
          <div className="relative bg-white w-full rounded-2xl shadow-2xl overflow-hidden max-w-xs transform transition-all">
            <div className="p-6 text-center">
              <h2 className="text-lg font-bold text-slate-800">出库确认</h2>
              <p className="text-sm text-slate-500 mt-2">正在调整库存：<br /><span className="font-semibold text-slate-700">{outboundProduct.name}</span></p>
              <div className="mt-8 flex flex-col items-center">
                <label className="text-[10px] font-bold text-slate-400 tracking-widest mb-3 uppercase">出库数量</label>
                <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-xl">
                  <button
                    onClick={() => setOutboundCount(Math.max(1, outboundCount - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-primary shadow-sm active:scale-95"
                  >
                    <span className="material-icons">remove</span>
                  </button>
                  <div className="w-12 text-center">
                    <span className="text-xl font-bold">{outboundCount}</span>
                  </div>
                  <button
                    onClick={() => setOutboundCount(Math.min(outboundProduct.stock, outboundCount + 1))}
                    className="w-10 h-10 flex items-center justify-center bg-primary rounded-lg text-white shadow-md active:scale-95"
                  >
                    <span className="material-icons">add</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex border-t border-van-border">
              <button onClick={() => setOutboundProduct(null)} className="flex-1 py-4 text-slate-500 font-semibold text-sm border-r border-van-border active:bg-van-bg">取消</button>
              <button onClick={handleOutboundConfirm} className="flex-1 py-4 text-primary font-bold text-sm active:bg-van-bg">确认</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const AddProductScreen: React.FC<{
  onBack: () => void,
  onSave: (p: Product) => void,
  product?: Product | null,
  categories: Category[]
}> = ({ onBack, onSave, product, categories }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name || '',
    cost: product?.cost || 0,
    price: product?.price || 0,
    stock: product?.stock || 0,
    category: product?.category || (categories[0]?.name || '电子数码'),
    image: product?.image || 'https://picsum.photos/seed/new/200/200',
    sku: product?.sku || `SKU-${Date.now()}`,
    id: product?.id || `p-${Date.now()}`,
    status: product?.status || 'normal'
  });

  const [showCatPicker, setShowCatPicker] = useState(false);

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'stock') {
        const stockNum = parseInt(value) || 0;
        updated.status = stockNum <= 5 ? 'warning' : stockNum <= 20 ? 'low' : 'normal';
      }
      return updated;
    });
  };

  const handleSave = () => {
    onSave(formData as Product);
  };

  return (
    <div className="bg-van-bg min-h-screen">
      <Header title={product ? "商品详情" : "添加新商品"} showBack onBack={onBack} />
      <main className="pb-32">
        <form className="py-4 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <div className="px-5 mb-2">
              <h2 className="text-xs font-medium text-van-secondary uppercase tracking-wider">商品基本信息</h2>
            </div>
            <div className="bg-white border-y border-van-border">
              <div className="flex items-center px-4 min-h-[50px] border-b border-van-border last:border-none">
                <label className="w-28 text-sm font-medium text-slate-700">商品名称</label>
                <input
                  className="flex-1 border-none focus:ring-0 bg-transparent text-sm py-3 px-0"
                  placeholder="请输入商品名称"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="px-5 mb-2">
              <h2 className="text-xs font-medium text-van-secondary uppercase tracking-wider">价格信息</h2>
            </div>
            <div className="bg-white border-y border-van-border">
              <div className="flex items-center px-4 min-h-[50px] border-b border-van-border last:border-none">
                <label className="w-28 text-sm font-medium text-slate-700">成本价</label>
                <div className="flex items-center flex-1">
                  <span className="text-slate-400 text-sm mr-1">¥</span>
                  <input
                    className="flex-1 border-none focus:ring-0 bg-transparent text-sm py-3 px-0"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="flex items-center px-4 min-h-[50px] border-b border-van-border last:border-none">
                <label className="w-28 text-sm font-medium text-slate-700">售价</label>
                <div className="flex items-center flex-1">
                  <span className="text-slate-400 text-sm mr-1">¥</span>
                  <input
                    className="flex-1 border-none focus:ring-0 bg-transparent text-sm py-3 px-0"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="px-5 mb-2">
              <h2 className="text-xs font-medium text-van-secondary uppercase tracking-wider">库存与分类</h2>
            </div>
            <div className="bg-white border-y border-van-border">
              <div className="flex items-center px-4 min-h-[50px] border-b border-van-border last:border-none">
                <label className="w-28 text-sm font-medium text-slate-700">{product ? "当前库存" : "初始库存"}</label>
                <input
                  className="flex-1 border-none focus:ring-0 bg-transparent text-sm py-3 px-0"
                  placeholder="0"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                />
              </div>
              <div
                onClick={() => setShowCatPicker(true)}
                className="flex items-center px-4 min-h-[50px] border-b border-van-border last:border-none active:bg-van-bg cursor-pointer"
              >
                <label className="w-28 text-sm font-medium text-slate-700">商品分类</label>
                <div className="flex-1 text-sm text-slate-800">{formData.category}</div>
                <span className="material-icons text-slate-300">chevron_right</span>
              </div>
            </div>
          </div>

          <div>
            <div className="px-5 mb-2">
              <h2 className="text-xs font-medium text-van-secondary uppercase tracking-wider">商品图片</h2>
            </div>
            <div className="px-5">
              {formData.image ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-van-border">
                  <img src={formData.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="material-icons text-white text-sm">edit</span>
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                  <span className="material-icons">add_a_photo</span>
                  <span className="text-[10px] mt-1">修改图片</span>
                </div>
              )}
            </div>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-van-border px-5 pt-4 pb-safe z-50">
        <button
          onClick={handleSave}
          className="w-full bg-primary text-white font-semibold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all"
        >
          {product ? "保存修改" : "保存商品"}
        </button>
      </div>

      {showCatPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6" onClick={() => setShowCatPicker(false)}>
          <div
            className="bg-white w-full max-w-lg rounded-2xl overflow-hidden animate-[slideUp_0.3s_ease-out] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-van-border flex justify-between items-center">
              <h3 className="font-bold">选择商品分类</h3>
              <button onClick={() => setShowCatPicker(false)} className="text-slate-400 p-1">
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => { handleChange('category', cat.name); setShowCatPicker(false); }}
                  className={`px-6 py-4 flex items-center gap-4 active:bg-van-bg cursor-pointer ${formData.category === cat.name ? 'text-primary' : ''}`}
                >
                  <span className="material-icons opacity-60">{cat.icon}</span>
                  <span className="font-medium flex-1">{cat.name}</span>
                  {formData.category === cat.name && <span className="material-icons text-sm">check_circle</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const ReportsScreen: React.FC<{ products: Product[], categories: Category[] }> = ({ products, categories }) => {
  const categoryStats = useMemo(() => {
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    if (totalStock === 0) return [];

    const stats = categories.map((cat, idx) => {
      const catStock = products
        .filter(p => p.category === cat.name)
        .reduce((acc, p) => acc + p.stock, 0);

      const percentage = Math.round((catStock / totalStock) * 100);
      const colors = ['bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-slate-400'];

      return {
        label: cat.name,
        val: percentage,
        color: colors[idx % colors.length]
      };
    });

    return stats.sort((a, b) => b.val - a.val);
  }, [products, categories]);

  const trendData = useMemo(() => {
    const total = products.length;
    return [
      Math.max(20, total * 0.8),
      Math.max(25, total * 0.7),
      Math.max(40, total * 0.9),
      Math.max(30, total * 0.75),
      Math.max(50, total * 1.1),
      Math.max(35, total * 0.85),
      100
    ].map(v => Math.min(100, v));
  }, [products]);

  return (
    <div className="bg-van-bg min-h-screen pb-24">
      <Header title="数据报表" />
      <main className="p-4 space-y-6">
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-van-border">
          <h3 className="text-sm font-bold text-slate-800 mb-4">本周库存变动趋势</h3>
          <div className="flex items-end justify-between h-40 gap-2 px-2">
            {trendData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-primary/10 rounded-t-sm relative group overflow-hidden" style={{ height: `${val}%` }}>
                  <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-primary h-1"></div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">0{i + 1}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-van-border">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">周入库总量</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-800">4,280</span>
              <span className="text-[10px] text-success font-bold">+12%</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-van-border">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">周出库总量</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-800">3,152</span>
              <span className="text-[10px] text-danger font-bold">-5%</span>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-5 shadow-sm border border-van-border">
          <h3 className="text-sm font-bold text-slate-800 mb-4">各分类占比分析</h3>
          <div className="space-y-4">
            {categoryStats.length > 0 ? categoryStats.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="text-slate-800 font-bold">{item.val}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-700 ease-out`} style={{ width: `${item.val}%` }}></div>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-xs text-slate-400 font-medium">暂无数据</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const SettingsScreen: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
  <div className="bg-van-bg min-h-screen pb-24">
    <Header title="系统设置" />
    <main className="py-6 space-y-6">
      <section className="px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-van-border flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-van-border">
            <img src="https://picsum.photos/seed/admin/200/200" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">管理员</h2>
          </div>
        </div>
      </section>

      <section className="space-y-1">
        <div className="px-5 mb-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">账号信息</h3>
        </div>
        <div className="bg-white border-y border-van-border">
          <div className="flex items-center justify-between px-4 py-4 border-b border-van-border last:border-none active:bg-van-bg">
            <div className="flex items-center gap-3">
              <span className="material-icons text-slate-400 text-xl">badge</span>
              <span className="text-sm font-medium">工号</span>
            </div>
            <span className="text-sm text-slate-500 font-medium tracking-tight">ID-2024001</span>
          </div>
          <div className="flex items-center justify-between px-4 py-4 border-b border-van-border last:border-none active:bg-van-bg">
            <div className="flex items-center gap-3">
              <span className="material-icons text-slate-400 text-xl">phone_iphone</span>
              <span className="text-sm font-medium">联系电话</span>
            </div>
            <span className="text-sm text-slate-500 font-medium tracking-tight">138 **** 8888</span>
          </div>
          <div className="flex items-center justify-between px-4 py-4 border-b border-van-border last:border-none active:bg-van-bg">
            <div className="flex items-center gap-3">
              <span className="material-icons text-slate-400 text-xl">mail_outline</span>
              <span className="text-sm font-medium">电子邮箱</span>
            </div>
            <span className="text-sm text-slate-500 font-medium tracking-tight">admin@smartinv.com</span>
          </div>
        </div>
      </section>

      <section className="px-4 pt-6">
        <button
          onClick={onLogout}
          className="w-full bg-white text-danger font-bold py-4 rounded-xl shadow-sm border border-danger/20 active:bg-danger/5 transition-all flex items-center justify-center gap-2 group"
        >
          <span className="material-icons text-lg group-active:translate-x-1 transition-transform">logout</span>
          退出登录
        </button>
        <p className="text-center text-[10px] text-slate-400 mt-6 font-medium tracking-tight opacity-60">
          SmartInventory Pro v4.2.0 (Build 2024.12.01)
        </p>
      </section>
    </main>
  </div>
);

const ScanInventoryScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [inventoryCount, setInventoryCount] = useState(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const simulateScan = () => {
    setIsScanning(false);
    const randomProduct = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
    setScannedProduct(randomProduct);
    setInventoryCount(randomProduct.stock);
  };

  const handleConfirm = () => {
    onBack();
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 h-[60px] ios-safe-top bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20 transition-colors">
          <span className="material-icons text-white">close</span>
        </button>
        <h2 className="text-white font-bold">扫码盘点</h2>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20 transition-colors">
          <span className="material-icons text-white">flash_on</span>
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {isScanning ? (
          <div className="relative z-10 w-64 h-64 border-2 border-primary/40 flex items-center justify-center rounded-3xl">
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-2xl"></div>
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-2xl"></div>
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-2xl"></div>

            <div className="w-full h-0.5 bg-primary/80 shadow-[0_0_15px_rgba(25,137,250,0.8)] animate-[scanLine_2.5s_infinite]"></div>

            <div className="absolute -bottom-16 text-center w-full">
              <p className="text-white/80 text-sm font-medium">请将条码/二维码放入框内</p>
              <button
                onClick={simulateScan}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-full text-xs font-bold active:scale-95 shadow-lg"
              >
                模拟扫码成功
              </button>
            </div>
          </div>
        ) : scannedProduct ? (
          <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm flex flex-col justify-end">
            <div className="bg-white rounded-t-3xl p-6 animate-[slideUp_0.4s_ease-out]">
              <div className="flex gap-4 items-start mb-6">
                <img src={scannedProduct.image} alt="" className="w-20 h-20 rounded-xl object-cover bg-slate-100" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg leading-tight mb-1">{scannedProduct.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">SKU: {scannedProduct.sku}</p>
                  <p className="text-xs text-slate-400 mt-1">当前库存: {scannedProduct.stock}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">盘点实物数量</label>
                  <div className="flex items-center gap-4 bg-slate-100 p-3 rounded-2xl">
                    <button
                      onClick={() => setInventoryCount(Math.max(0, inventoryCount - 1))}
                      className="w-12 h-12 flex items-center justify-center bg-white rounded-xl text-primary shadow-sm active:scale-95"
                    >
                      <span className="material-icons">remove</span>
                    </button>
                    <div className="flex-1 text-center">
                      <input
                        type="number"
                        value={inventoryCount}
                        onChange={(e) => setInventoryCount(parseInt(e.target.value) || 0)}
                        className="w-full bg-transparent border-none text-center text-2xl font-bold focus:ring-0"
                      />
                    </div>
                    <button
                      onClick={() => setInventoryCount(inventoryCount + 1)}
                      className="w-12 h-12 flex items-center justify-center bg-primary rounded-xl text-white shadow-md active:scale-95"
                    >
                      <span className="material-icons">add</span>
                    </button>
                  </div>
                </div>

                {inventoryCount !== scannedProduct.stock && (
                  <div className={`p-3 rounded-xl flex items-center gap-2 ${inventoryCount > scannedProduct.stock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    <span className="material-icons text-sm">{inventoryCount > scannedProduct.stock ? 'trending_up' : 'trending_down'}</span>
                    <span className="text-xs font-bold">
                      盘点结果：{inventoryCount > scannedProduct.stock ? '多盘' : '漏盘'} {Math.abs(inventoryCount - scannedProduct.stock)} 件
                    </span>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setIsScanning(true)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl active:opacity-70">
                    重扫
                  </button>
                  <button onClick={handleConfirm} className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98]">
                    确认盘点
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <style>{`
        @keyframes scanLine {
          0% { transform: translateY(-130px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(130px); opacity: 0; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.DASHBOARD);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 使用 Supabase 后端 Hooks
  const auth = useAuth();
  const { categories, addCategory, updateCategory } = useCategories(auth.isLoggedIn);
  const { products, saveProduct, updateProduct } = useProducts(auth.isLoggedIn);
  const { activities, addActivity } = useActivities(auth.isLoggedIn);

  const navigate = (screen: Screen) => {
    if (screen !== Screen.ADD_PRODUCT) {
      setEditingProduct(null);
    }
    setCurrentScreen(screen);
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleAddCategory = async (name: string) => {
    try {
      await addCategory(name);
    } catch (err) {
      console.error('新增分类失败:', err);
    }
  };

  const handleUpdateCategory = async (id: string, newName: string) => {
    try {
      await updateCategory(id, newName);
    } catch (err) {
      console.error('更新分类失败:', err);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    navigate(Screen.ADD_PRODUCT);
  };

  const handleSaveProduct = async (p: Product) => {
    try {
      const { saved, isNew, oldProduct } = await saveProduct(p);
      // 记录活动日志
      if (isNew) {
        await addActivity('in', '新增入库', `${saved.name} - ${saved.stock} 件`);
      } else if (oldProduct) {
        const stockDiff = p.stock - oldProduct.stock;
        if (stockDiff !== 0) {
          await addActivity(
            stockDiff > 0 ? 'in' : 'out',
            stockDiff > 0 ? '入库调整' : '商品出库',
            `${saved.name} - ${stockDiff > 0 ? '增加' : '减少'} ${Math.abs(stockDiff)} 件`
          );
        } else if (p.name !== oldProduct.name || p.price !== oldProduct.price) {
          await addActivity('move', '信息更新', `更新了商品 ${saved.name} 的基本信息`);
        }
      }
    } catch (err) {
      console.error('保存商品失败:', err);
    }
  };

  const handleUpdateProductDirect = async (p: Product) => {
    try {
      const oldProduct = products.find(item => item.id === p.id);
      await updateProduct(p);
      if (oldProduct) {
        const stockDiff = p.stock - oldProduct.stock;
        if (stockDiff !== 0) {
          await addActivity(
            stockDiff > 0 ? 'in' : 'out',
            stockDiff > 0 ? '入库调整' : '商品出库',
            `${p.name} - ${stockDiff > 0 ? '增加' : '减少'} ${Math.abs(stockDiff)} 件`
          );
        }
      }
    } catch (err) {
      console.error('更新商品失败:', err);
    }
  };

  // 认证加载中
  if (auth.loading) {
    return (
      <div className="min-h-screen bg-van-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录 → 显示登录页
  if (!auth.isLoggedIn) {
    return (
      <LoginScreen
        onLogin={async (email, password) => {
          await auth.signIn(email, password);
        }}
        onRegister={async (email, password) => {
          await auth.signUp(email, password);
        }}
      />
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.DASHBOARD:
        return <DashboardScreen onNavigate={navigate} products={products} activities={activities} />;
      case Screen.CATEGORY_LIST:
        return (
          <CategoryListScreen
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onBack={() => navigate(Screen.DASHBOARD)}
          />
        );
      case Screen.PRODUCT_LIST:
        return (
          <ProductListScreen
            onEditProduct={handleEditProduct}
            onUpdateProduct={handleUpdateProductDirect}
            categories={categories}
            products={products}
          />
        );
      case Screen.ADD_PRODUCT:
        return (
          <AddProductScreen
            product={editingProduct}
            categories={categories}
            onBack={() => navigate(Screen.PRODUCT_LIST)}
            onSave={async (p) => { await handleSaveProduct(p); navigate(Screen.PRODUCT_LIST); }}
          />
        );
      case Screen.REPORTS:
        return <ReportsScreen products={products} categories={categories} />;
      case Screen.SETTINGS:
        return <SettingsScreen onLogout={handleLogout} />;
      case Screen.SCAN_INVENTORY:
        return <ScanInventoryScreen onBack={() => navigate(Screen.DASHBOARD)} />;
      default:
        return <DashboardScreen onNavigate={navigate} products={products} activities={activities} />;
    }
  };

  return (
    <div className="min-h-screen bg-van-bg">
      {renderScreen()}
      {![Screen.CATEGORY_LIST, Screen.ADD_PRODUCT, Screen.LOGIN, Screen.SCAN_INVENTORY].includes(currentScreen) && (
        <TabBar activeTab={currentScreen} onTabChange={navigate} />
      )}
    </div>
  );
};

export default App;
