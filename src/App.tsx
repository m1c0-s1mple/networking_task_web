import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  Boxes, 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  TrendingUp,
  Settings,
  UserCheck,
  Building,
  Mail,
  Phone,
  DollarSign,
  Barcode,
  Package,
  Calendar,
  Lock,
  LogOut,
  FolderMinus,
  Briefcase
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Legend,
  Cell
} from 'recharts';
import { Customer, Product, Order, OrderItem, User } from './types';
import * as api from './services/api';

// Root level state pre-sets
const INITIAL_DEMO_USER: User = {
  id: 'usr-admin',
  email: 'admin@clothingcorp.com',
  name: 'Sarah Jenkins',
  role: 'ADMIN'
};

export default function App() {
  // Authentication Guard States
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('erp_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [syncError, setSyncError] = useState('');

  // Primary Domain Business State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Navigation Panel Views
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'wms' | 'erp'>('dashboard');

  // Input Modals Control
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Search Filter Variables
  const [crmQuery, setCrmQuery] = useState('');
  const [wmsQuery, setWmsQuery] = useState('');
  const [erpQuery, setErpQuery] = useState('');

  // Creator form inputs (Customers)
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Creator form inputs (Products)
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdQty, setNewProdQty] = useState('');

  // New sales order variables
  const [selectedCustId, setSelectedCustId] = useState('');
  const [orderDraftItems, setOrderDraftItems] = useState<{ productId: string; quantity: number }[]>([]);

  // Real-time synchronization loader
  useEffect(() => {
    if (currentUser) {
      const loadData = async () => {
        setDataLoading(true);
        setSyncError('');
        try {
          const [cList, pList, oList] = await Promise.all([
            api.fetchCustomers(),
            api.fetchProducts(),
            api.fetchOrders()
          ]);
          setCustomers(cList);
          setProducts(pList);
          setOrders(oList);
        } catch (err: any) {
          setSyncError(err.message || 'API connection failed. Please ensure the server is active.');
        } finally {
          setDataLoading(false);
        }
      };
      loadData();
    }
  }, [currentUser]);

  // Auth Submit Action Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === 'admin@clothingcorp.com' && loginPassword === 'Password123') {
      setCurrentUser(INITIAL_DEMO_USER);
      localStorage.setItem('erp_active_user', JSON.stringify(INITIAL_DEMO_USER));
      setLoginError('');
    } else {
      setLoginError('Invalid business login coordinates. Please confirm corporate seeds.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('erp_active_user');
  };

  // Business Action Handlers: Customers Directory
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newContactPerson.trim() || !newEmail.trim()) return;

    try {
      const added = await api.createCustomer({
        companyName: newCompanyName.trim(),
        contactPerson: newContactPerson.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim()
      });
      setCustomers(prev => [...prev, added]);
      setNewCompanyName('');
      setNewContactPerson('');
      setNewEmail('');
      setNewPhone('');
      setCustomerModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error occurred while creating client profile.');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await api.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting client.');
    }
  };

  // Business Action Handlers: Product SKUs Inventory
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdSku.trim() || !newProdPrice) return;

    try {
      const added = await api.createProduct({
        name: newProdName.trim(),
        sku: newProdSku.trim().toUpperCase(),
        price: Math.max(0.01, parseFloat(newProdPrice)),
        quantity: Math.max(0, parseInt(newProdQty) || 0)
      });
      setProducts(prev => [...prev, added]);
      setNewProdName('');
      setNewProdSku('');
      setNewProdPrice('');
      setNewProdQty('');
      setProductModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error creating product.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error during SKU removal.');
    }
  };

  const adjustStockLevel = async (productId: string, delta: number) => {
    try {
      const updated = await api.adjustProductStock(productId, delta);
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
    } catch (err: any) {
      alert(err.message || 'Stock adjustments failed.');
    }
  };

  // Interactive Draft Sales Order Creators
  const selectItemForDraft = (productId: string) => {
    setOrderDraftItems(prev => {
      const match = prev.find(item => item.productId === productId);
      if (match) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateDraftItemQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setOrderDraftItems(prev => prev.filter(item => item.productId !== productId));
      return;
    }
    setOrderDraftItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity: qty } : item));
  };

  const removeDraftItem = (productId: string) => {
    setOrderDraftItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId || orderDraftItems.length === 0) return;

    try {
      await api.placeOrder({
        customerId: selectedCustId,
        draftItems: orderDraftItems
      });

      // Synchronize quantities with server state databases to maintain perfect inventory
      const [pList, oList] = await Promise.all([
        api.fetchProducts(),
        api.fetchOrders()
      ]);
      setProducts(pList);
      setOrders(oList);

      // Cleanup draft states
      setOrderDraftItems([]);
      setSelectedCustId('');
      setOrderModalOpen(false);
    } catch (err: any) {
      alert(`WMS Stock Validation Error:\n${err.message}`);
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: Order['status']) => {
    try {
      await api.updateOrderStatus(id, newStatus);
      const [pList, oList] = await Promise.all([
        api.fetchProducts(),
        api.fetchOrders()
      ]);
      setProducts(pList);
      setOrders(oList);
    } catch (err: any) {
      alert(err.message || 'Status translation exception.');
    }
  };

  // KPIs Calculations
  const grossCorporateRevenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((total, current) => total + current.totalAmount, 0);

  const thresholdAlertIndex = 12;
  const criticalSkuAlertCount = products.filter(p => p.quantity < thresholdAlertIndex).length;

  // Chart Mappers
  const chartSalesTrends = orders
    .filter(o => o.status !== 'CANCELLED')
    .slice()
    .reverse()
    .map(o => ({
      ticket: `#${o.id}`,
      amount: o.totalAmount,
      customer: o.customerName.length > 12 ? `${o.customerName.slice(0, 10)}...` : o.customerName
    }));

  const chartInventoryLevels = products.map(p => ({
    name: p.sku,
    stock: p.quantity,
    price: p.price
  }));

  // Match list arrays based on search keys
  const matchedCustomers = customers.filter(c => 
    c.companyName.toLowerCase().includes(crmQuery.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(crmQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(crmQuery.toLowerCase())
  );

  const matchedProducts = products.filter(p => 
    p.name.toLowerCase().includes(wmsQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(wmsQuery.toLowerCase())
  );

  const matchedOrders = orders.filter(o => 
    o.id.toLowerCase().includes(erpQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(erpQuery.toLowerCase()) ||
    o.status.toLowerCase().includes(erpQuery.toLowerCase())
  );

  // NON-AUTHENTICATED PORTAL LOGIN UI
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 relative flex flex-col justify-between font-sans selection:bg-indigo-500/10 text-slate-800">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500" />
        
        {/* Ambient Top Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#f1f5f9_0%,#f8fafc_100%)] opacity-75 pointer-events-none" />

        <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden transition-all">
            
            {/* Header Badge */}
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  ClothingCorp Central Hub
                </span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                v2.1 Stable
              </span>
            </div>

            <div className="p-8 pb-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mx-auto mb-3 border border-indigo-100 shadow-sm">
                  <Lock className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Enterprise ERP Gateway
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Access CRM account maps and real-time WMS stock inventory directories.
                </p>
              </div>

              {loginError && (
                <div className="mb-4 bg-rose-50 border border-rose-150 rounded-lg p-3 text-xs text-rose-600 flex items-start gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 font-mono">
                    IAM Account Email
                  </label>
                  <input 
                    type="email" 
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@clothingcorp.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-lg py-2 px-3 text-slate-900 text-sm outline-none transition-all duration-150"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 font-mono">
                    Access Token Password
                  </label>
                  <input 
                    type="password" 
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-lg py-2 px-3 text-slate-900 text-sm outline-none transition-all duration-150"
                  />
                </div>

                <button 
                  type="submit" 
                  className="cursor-pointer w-full bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  Authorize SECURE Tunnel Login
                </button>
              </form>
            </div>



          </div>
        </div>

        {/* Outer bottom subtle banner */}
        <div className="bg-slate-100 border-t border-slate-200 py-3 text-center">
          <p className="text-[10px] text-slate-500 font-mono tracking-wide">
            ClothingCorp Global Resource Planner • SSL Protected Database State Lock
          </p>
        </div>
      </div>
    );
  }

  // REDESIGNED SATISFACTORY ENTERPRISE SYSTEM WORKSPACE UI
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex">
      
      {/* 1. LEFT SIDE NAVIGATION DRAWER */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed top-0 bottom-0 left-0 z-30 flex flex-col justify-between py-6">
        <div>
          {/* Logo Brand Header */}
          <div className="px-6 pb-6 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm font-black text-sm">
              CC
            </div>
            <div>
              <h2 className="text-xs font-bold font-mono tracking-wider text-slate-900 uppercase">
                ClothingCorp
              </h2>
              <span className="text-[10px] text-emerald-600 font-semibold tracking-widest uppercase block -mt-0.5">
                ERP • CRM • WMS
              </span>
            </div>
          </div>

          {/* Connected User Profile */}
          <div className="mx-4 mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-50/10 border border-indigo-200 bg-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-700 shadow-sm">
              SJ
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-semibold text-slate-900 truncate">
                {currentUser.name}
              </span>
              <span className="block text-[10px] text-slate-400 font-mono truncate">
                Role: {currentUser.role}
              </span>
            </div>
          </div>

          {/* Navigation Menus List */}
          <div className="px-3 mt-6 space-y-1">
            <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-3 mb-2">
              System Modules
            </p>

            <button 
              id="sidebar-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>Core Dashboard</span>
            </button>

            <button 
              id="sidebar-tab-crm"
              onClick={() => setActiveTab('crm')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'crm'
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>CRM Customers</span>
            </button>

            <button 
              id="sidebar-tab-wms"
              onClick={() => setActiveTab('wms')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'wms'
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Boxes className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>WMS Inventory</span>
            </button>

            <button 
              id="sidebar-tab-erp"
              onClick={() => setActiveTab('erp')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'erp'
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>ERP sales orders</span>
            </button>
          </div>
        </div>

        {/* Bottom Disconnect Button */}
        <div className="px-4">
          <button 
            onClick={handleLogout}
            className="cursor-pointer w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-mono font-semibold transition-all duration-150"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Revoke Session</span>
          </button>
        </div>
      </aside>

      {/* 2. DYNAMIC CONTENT MAIN PLANE */}
      <div className="flex-1 pl-64 min-h-screen flex flex-col">
        
        {/* Top Header Information Panel */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-md border border-indigo-100 font-mono">
              Corporate Master Database Node
            </span>
            <span className="text-xs text-slate-400">• Active Replication Synchronized</span>
          </div>

          <div id="quick-indicators-row" className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="font-mono text-slate-600">Storage status: Green</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="font-mono text-slate-600 text-right">
              Local: <span className="font-bold text-slate-900">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Screens Router */}
        <div className="flex-1 p-8 overflow-y-auto max-w-[1400px] w-full mx-auto space-y-6">
          
          {/* TAB 1: CORE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Header Title Grid */}
              <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    Retail Resource & Inventory Management Planner
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Synchronized analytical monitoring pipeline showcasing core CRM business directories, physical apparel catalog parameters, and placed orders.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Database health:</span>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-md font-mono border border-emerald-100">
                    Perfect Live State
                  </span>
                </div>
              </div>

              {/* 4 Cards Statistics Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Gross rev */}
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Gross Placed Revenue
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">
                      ${grossCorporateRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[10px] text-emerald-600 font-sans mt-1.5 flex items-center gap-1 font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" /> Total Active Sales
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                {/* Clients index */}
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      CRM Account Maps
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">
                      {customers.length} Corporate Clients
                    </h3>
                    <p className="text-[10px] text-indigo-600 font-sans mt-1.5 font-semibold">
                      Registered Retail Accounts
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 border border-slate-200">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                {/* Warehouse quantities warnings */}
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      WMS Low Stock Warnings
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">
                      {criticalSkuAlertCount} SKUs Actionable
                    </h3>
                    <p className="text-[10px] text-amber-600 font-sans mt-1.5 flex items-center gap-1 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Replenishment in WMS SKU view
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                    <Boxes className="w-5 h-5" />
                  </div>
                </div>

                {/* Active orders counts */}
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Orders Registered
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">
                      {orders.length} Active System Tickets
                    </h3>
                    <p className="text-[10px] text-indigo-600 font-sans mt-1.5 font-semibold">
                      Approved Pipeline Sales
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
                    <ShoppingBag className="w-5 h-5 animate-pulse" />
                  </div>
                </div>

              </div>

              {/* Graphical Trend Analyses (AreaChart and BarChart Side-By-Side) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Sale Area charts */}
                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
                      Sales Transactions Velocity
                    </h3>
                    <p className="text-xs text-slate-500">
                      Shows placed chronological orders corresponding to client corporate revenue pipelines.
                    </p>
                  </div>

                  <div className="h-64">
                    {chartSalesTrends.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartSalesTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gradientRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4338ca" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#4338ca" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="ticket" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                          />
                          <Area type="monotone" dataKey="amount" stroke="#4338ca" strokeWidth={2} fillOpacity={1} fill="url(#gradientRev)" name="Order Amount ($)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                        <FolderMinus className="w-10 h-10 stroke-1" />
                        <span className="text-xs font-mono">No transactions synchronized yet.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Warehouse quantities distributions bars */}
                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
                      WMS Physical Catalog Distributions
                    </h3>
                    <p className="text-xs text-slate-500">
                      Units level balance currently allocated inside warehouse designated bins.
                    </p>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartInventoryLevels} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                          labelStyle={{ fontWeight: 'bold' }}
                        />
                        <Bar dataKey="stock" fill="#0ea5e9" name="Stock quantity (Units)" radius={[4, 4, 0, 0]}>
                          {chartInventoryLevels.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.stock < thresholdAlertIndex ? '#f59e0b' : '#3b82f6'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Recent Orders Overview table */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
                      Recent Activity Sales Logs
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Chronological list of placed orders from our local store accounts.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('erp')}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    Manage Orders &rarr;
                  </button>
                </div>

                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-[#f8fafc] border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider font-mono">
                        <tr>
                          <th className="py-3 px-6">ID Node</th>
                          <th className="py-3 px-6">Company Target</th>
                          <th className="py-3 px-6">Items Enrolled</th>
                          <th className="py-3 px-6">Total Amount</th>
                          <th className="py-3 px-6 text-center">Status Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/55 transition-colors">
                            <td className="py-3.5 px-6 font-mono font-bold text-slate-950">
                              #{ord.id}
                            </td>
                            <td className="py-3.5 px-6 font-semibold text-slate-900">
                              {ord.customerName}
                            </td>
                            <td className="py-3.5 px-6">
                              {ord.orderItems.length} specific SKU list
                            </td>
                            <td className="py-3.5 px-6 font-mono font-bold text-slate-900 text-sm">
                              ${ord.totalAmount.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-6 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold font-mono uppercase tracking-wider ${
                                ord.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                ord.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                ord.status === 'SHIPPED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                'bg-rose-50 text-rose-700 border border-rose-100'
                              }`}>
                                {ord.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500">
                    <p className="text-xs">No orders created. Use ERP tab to finalize a custom transaction.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: CRM CUSTOMERS MAPS */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              
              {/* Header Title Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm gap-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" /> CRM Accounts Corporate Registry
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage client apparel associations, retrieve contact credentials, and authorize corporate trade relationships.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="relative w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text"
                      placeholder="Search company or contact..."
                      value={crmQuery}
                      onChange={(e) => setCrmQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-lg py-1.5 pl-9 pr-3 text-xs outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <button 
                    onClick={() => setCustomerModalOpen(true)}
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Account
                  </button>
                </div>
              </div>

              {/* Customer Directory Grids */}
              {matchedCustomers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {matchedCustomers.map((cust) => {
                    // Compute client total orders
                    const clientOrders = orders.filter(o => o.customerId === cust.id);
                    const totalPurchased = clientOrders
                      .filter(o => o.status !== 'CANCELLED')
                      .reduce((sum, current) => sum + current.totalAmount, 0);

                    return (
                      <div key={cust.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors">
                        <div className="p-5 space-y-4">
                          
                          {/* Top Identification Badge card */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Client Partner
                              </span>
                              <h3 className="text-sm font-bold text-slate-900 mt-1">
                                {cust.companyName}
                              </h3>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                              <Building className="w-4 h-4 text-slate-500" />
                            </div>
                          </div>

                          {/* Contact Details stack */}
                          <div className="text-xs space-y-2 border-t border-slate-100 pt-3">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>Person: <strong>{cust.contactPerson}</strong></span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-600">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{cust.email}</span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{cust.phone}</span>
                            </div>
                          </div>

                          {/* Stats parameters of current user */}
                          <div className="bg-slate-50 p-2.5 rounded-lg grid grid-cols-2 gap-2 text-center text-[10px]">
                            <div className="border-r border-slate-200">
                              <span className="block text-slate-400 font-mono text-[9px] uppercase tracking-wider">Purchases Volume</span>
                              <strong className="block text-slate-950 font-mono text-xs mt-0.5">${totalPurchased.toLocaleString()}</strong>
                            </div>
                            <div>
                              <span className="block text-slate-400 font-mono text-[9px] uppercase tracking-wider">Orders Enrolled</span>
                              <strong className="block text-slate-950 font-mono text-xs mt-0.5">{clientOrders.length} tickets</strong>
                            </div>
                          </div>

                        </div>

                        {/* Card Options Row */}
                        <div className="bg-slate-50/70 border-t border-slate-100 px-5 py-3 flex items-center justify-between">
                          <span className="text-[9px] text-slate-400 font-mono">
                            Linked: {new Date(cust.createdAt).toLocaleDateString()}
                          </span>
                          <button 
                            onClick={() => handleDeleteCustomer(cust.id)}
                            className="cursor-pointer text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-all"
                            title="De-authorize Corporate Customer Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-250 py-16 text-center text-slate-500">
                  <FolderMinus className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No customer accounts match your search coordinate.</p>
                  <p className="text-xs text-slate-400 mt-1">Refine filters or add a physical corporate company asset above.</p>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: WMS INVENTORY SKU WAREHOUSE */}
          {activeTab === 'wms' && (
            <div className="space-y-6">
              
              {/* Header Title and Search Panels */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm gap-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-indigo-600" /> WMS Physical Inventory Control Center
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Review allocated storage parameters, configure brand new product SKUs, and replenish inventory lines.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="relative w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text"
                      placeholder="Search SKU or name description..."
                      value={wmsQuery}
                      onChange={(e) => setWmsQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-lg py-1.5 pl-9 pr-3 text-xs outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <button 
                    onClick={() => setProductModalOpen(true)}
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Catalog SKU
                  </button>
                </div>
              </div>

              {/* Physical Product Catalog listings */}
              {matchedProducts.length > 0 ? (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-[#f8fafc] border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider font-mono">
                        <tr>
                          <th className="py-3 px-6">SKU Identifier</th>
                          <th className="py-3 px-6">Product Description</th>
                          <th className="py-3 px-6">Direct Catalog Unit Price</th>
                          <th className="py-3 px-6 text-center">Warehouse Stock Quantities</th>
                          <th className="py-3 px-6 text-center font-mono">Safety Alert Indicator</th>
                          <th className="py-3 px-6 text-center">Action Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {matchedProducts.map((p) => {
                          const isLowStock = p.quantity < thresholdAlertIndex;

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-6 font-mono font-bold text-slate-900">
                                {p.sku}
                              </td>
                              <td className="py-4 px-6">
                                <span className="font-semibold text-slate-900 block">{p.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono truncate max-w-xs block mt-0.5">ID Node: {p.id}</span>
                              </td>
                              <td className="py-4 px-6 font-mono font-bold text-sm text-slate-900">
                                ${p.price.toFixed(2)}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  
                                  {/* Decrement stock */}
                                  <button 
                                    onClick={() => adjustStockLevel(p.id, -10)}
                                    className="cursor-pointer w-7 h-7 rounded border border-slate-200 flex items-center justify-center font-mono hover:bg-slate-100 text-slate-600 font-bold"
                                    title="Subtract -10 units physical counts"
                                  >
                                    -10
                                  </button>

                                  <div className="min-w-[50px] font-mono text-center font-black text-sm text-slate-900 px-2 py-1 bg-slate-50 border border-slate-100 rounded">
                                    {p.quantity}
                                  </div>

                                  {/* Increment stock */}
                                  <button 
                                    onClick={() => adjustStockLevel(p.id, 10)}
                                    className="cursor-pointer w-7 h-7 rounded border border-slate-200 flex items-center justify-center font-mono hover:bg-slate-100 text-indigo-700 font-bold"
                                    title="Add +10 units physical SKU counts"
                                  >
                                    +10
                                  </button>

                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex justify-center">
                                  {isLowStock ? (
                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded text-[10px] font-bold font-mono tracking-wide uppercase animate-pulse">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                      <span>Critical Replenish</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded text-[10px] font-bold font-mono tracking-wide uppercase font-semibold">
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                      <span>Normal Stack</span>
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <button 
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="cursor-pointer text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors"
                                  title="Retire Catalog SKU item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200/80 py-16 text-center text-slate-500">
                  <FolderMinus className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No warehouse SKU mappings found matching query.</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Introduce a physical inventory SKU using the catalog commands above.</p>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: ERP SALES ORDERS CENTER */}
          {activeTab === 'erp' && (
            <div className="space-y-6">
              
              {/* Header block with search & New Order trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm gap-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-indigo-600" /> ERP Sales Order Ledger & Processing Drawer
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Construct customer order documents, assign cargo validation processes, and synchronize transaction state pipelines.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="relative w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text"
                      placeholder="Search by order ID or status..."
                      value={erpQuery}
                      onChange={(e) => setErpQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-lg py-1.5 pl-9 pr-3 text-xs outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      if (customers.length === 0) {
                        alert("Please establish at least one corporate CRM Customer Account before creating orders.");
                        return;
                      }
                      setOrderModalOpen(true);
                    }}
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-55 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Create Sales Order
                  </button>
                </div>
              </div>

              {/* Transactions list index */}
              {matchedOrders.length > 0 ? (
                <div className="space-y-4">
                  {matchedOrders.map((ord) => (
                    <div key={ord.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-6 transition-all hover:border-slate-350">
                      
                      {/* Top Header Row of single order details */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="p-2 rounded bg-indigo-5 font-mono text-xs font-bold text-indigo-700 border border-indigo-100">
                            ID Match: #{ord.id}
                          </span>
                          <div>
                            <strong className="text-sm text-slate-900 block">{ord.customerName}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">Placed on: {new Date(ord.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Middle: Live State controllers */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 mr-1 uppercase tracking-wider font-mono text-[10px]">Processing Flow:</span>
                          
                          <button 
                            onClick={() => handleUpdateOrderStatus(ord.id, 'PENDING')}
                            className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                              ord.status === 'PENDING' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Pending
                          </button>

                          <button 
                            onClick={() => handleUpdateOrderStatus(ord.id, 'SHIPPED')}
                            className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                              ord.status === 'SHIPPED' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Shipped
                          </button>

                          <button 
                            onClick={() => handleUpdateOrderStatus(ord.id, 'COMPLETED')}
                            className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                              ord.status === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Completed
                          </button>

                          <button 
                            onClick={() => handleUpdateOrderStatus(ord.id, 'CANCELLED')}
                            className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                              ord.status === 'CANCELLED' ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            }`}
                          >
                            Cancel
                          </button>

                        </div>
                      </div>

                      {/* Items enrolled mapping lists */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        
                        <div className="md:col-span-2">
                          <span className="block font-semibold uppercase tracking-wider font-mono text-[10px] text-slate-400 mb-2">Package Items checklist</span>
                          <div className="space-y-1.5 max-h-24 overflow-y-auto">
                            {ord.orderItems.map((oi) => (
                              <div key={oi.id} className="flex justify-between text-xs py-1 px-2.5 bg-slate-50 border border-slate-100/50 rounded font-mono text-slate-700">
                                <span>{oi.productName}</span>
                                <strong className="text-slate-900">Qty: {oi.quantity} × ${oi.price.toFixed(2)}</strong>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Grand Total representation metrics */}
                        <div className="bg-slate-50 p-4 border border-slate-100 rounded-lg text-right flex flex-col justify-between h-full">
                          <span className="block font-semibold text-[9px] uppercase tracking-wider text-slate-500 font-mono">Invoice Total</span>
                          <div className="mt-1 text-slate-900 font-mono">
                            <strong className="text-base font-black">${ord.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                            <span className="block text-[8px] text-slate-400 mt-0.5 uppercase">Approved Transaction Sync</span>
                          </div>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200/80 py-16 text-center text-slate-500">
                  <FolderMinus className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No Sales Order records correspond to current filtration guidelines.</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Create an actionable invoice using the Create Sales Order coordinates above.</p>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Global Footer Credits */}
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-12">
          <p className="font-mono">ClothingCorp Enterprise Network © 2026 • Encrypted Host Database Connected Successfully</p>
        </footer>

      </div>

      {/* ========================================= MODALS DRAWERS IMPLEMENTATIONS ========================================= */}
      
      {/* DIALOG 1: ADD CRM CUSTOMER */}
      {customerModalOpen && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden animate-zoom">
            
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
              <strong className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wide">Configure Corporate Customer Asset</strong>
              <button 
                onClick={() => setCustomerModalOpen(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Company Trade Name *</label>
                <input 
                  type="text" 
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Tashkent Textiles Corp"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded py-2 px-3 text-xs outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Contact Person name *</label>
                <input 
                  type="text" 
                  required
                  value={newContactPerson}
                  onChange={(e) => setNewContactPerson(e.target.value)}
                  placeholder="e.g. Alisher Usmonov"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded py-2 px-3 text-xs outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Authorized Email *</label>
                <input 
                  type="email" 
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. alisher@textiles.uz"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded py-2 px-3 text-xs outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Authorized Phone</label>
                <input 
                  type="text" 
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +998 90 123 45 67"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded py-2 px-3 text-xs outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button 
                  type="button"
                  onClick={() => setCustomerModalOpen(false)}
                  className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-xs text-slate-600 transition-colors font-semibold"
                >
                  Dismiss
                </button>
                <button 
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-indigo-650 hover:bg-indigo-600 rounded text-xs text-white transition-colors font-semibold shadow-sm"
                >
                  Write Records
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* DIALOG 2: CATALOG NEW PRODUCT SKU */}
      {productModalOpen && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden animate-zoom">
            
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
              <strong className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wide">Register New Product SKU</strong>
              <button 
                onClick={() => setProductModalOpen(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">SKU Unique Code *</label>
                <input 
                  type="text" 
                  required
                  value={newProdSku}
                  onChange={(e) => setNewProdSku(e.target.value)}
                  placeholder="e.g. TS-BLU-COTTON-L"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded py-2 px-3 text-xs outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Item Title / Description *</label>
                <input 
                  type="text" 
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Premium Cotton Polo (Blue, L)"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded py-2 px-3 text-xs outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">MSRP Unit Price ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="29.99"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded py-2 px-3 text-xs outline-none transition-all placeholder:text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">Initial Storage Stock</label>
                  <input 
                    type="number" 
                    value={newProdQty}
                    onChange={(e) => setNewProdQty(e.target.value)}
                    placeholder="100"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded py-2 px-3 text-xs outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button 
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-xs text-slate-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-indigo-650 hover:bg-indigo-600 rounded text-xs text-white transition-colors font-semibold shadow-sm"
                >
                  Write SKU
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* DIALOG 3: CREATE ERP SALES ORDER DRAFT */}
      {orderModalOpen && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xl w-full max-w-3xl overflow-hidden animate-zoom">
            
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
              <strong className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wide">Generate ERP Sales Order Document</strong>
              <button 
                onClick={() => setOrderModalOpen(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Client selectors & Select items button catalog */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">1. Assign Target CRM Customer Accounts *</label>
                  <select 
                    required
                    value={selectedCustId}
                    onChange={(e) => setSelectedCustId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded py-2 px-3 text-xs outline-none transition-all"
                  >
                    <option value="">-- Choose Corporate Customer Account --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.companyName} ({c.contactPerson})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">2. Search & Select Items below</span>
                  
                  {/* Quick Catalog List to enroll item */}
                  <div className="border border-slate-200 rounded-lg p-2 bg-slate-50/50 max-h-56 overflow-y-auto space-y-1.5">
                    {products.map(p => {
                      const isLowStock = p.quantity === 0;

                      return (
                        <div key={p.id} className="flex justify-between items-center p-2 bg-white rounded border border-slate-150 text-xs hover:border-indigo-300 transition-colors">
                          <div className="flex-1 pr-2 min-w-0">
                            <span className="font-semibold text-slate-900 block truncate">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku} | Price: ${p.price.toFixed(2)} | In Stock: {p.quantity}</span>
                          </div>

                          <button 
                            type="button"
                            disabled={isLowStock}
                            onClick={() => selectItemForDraft(p.id)}
                            className="cursor-pointer h-7 px-2.5 bg-indigo-50 border border-indigo-150 rounded text-[10px] text-indigo-700 font-bold hover:bg-indigo-100 disabled:opacity-40 disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            + Enroll
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Checkout draft items details and price calculation */}
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200/60 flex flex-col justify-between">
                <div>
                  <strong className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-2">3. Enrolled Items Check-out</strong>
                  
                  {orderDraftItems.length > 0 ? (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {orderDraftItems.map((draft) => {
                        const targetProd = products.find(p => p.id === draft.productId);
                        if (!targetProd) return null;

                        const rowCost = targetProd.price * draft.quantity;

                        return (
                          <div key={draft.productId} className="flex items-center justify-between text-xs py-1.5 px-2 bg-white rounded border border-slate-150">
                            <div className="flex-1 pr-2 min-w-0">
                              <span className="font-semibold text-slate-900 block truncate">{targetProd.sku}</span>
                              <span className="text-[10px] text-slate-400">${targetProd.price.toFixed(2)} each</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <input 
                                type="number"
                                min="1"
                                max={targetProd.quantity}
                                value={draft.quantity}
                                onChange={(e) => updateDraftItemQuantity(draft.productId, parseInt(e.target.value) || 0)}
                                className="w-12 text-center bg-slate-50 border border-slate-200 rounded p-1 font-mono text-xs font-bold"
                              />

                              <button 
                                type="button"
                                onClick={() => removeDraftItem(draft.productId)}
                                className="cursor-pointer text-slate-400 hover:text-rose-600 p-1 rounded"
                                title="Exclude item from checkout list"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400">
                      <p className="text-xs">No product SKUs have been enrolled yet.</p>
                      <p className="text-[10px] mt-1 leading-relaxed">Select items from the catalog tree on the left side menu.</p>
                    </div>
                  )}
                </div>

                {/* Sub-total estimation and execution click */}
                <div className="border-t border-slate-200 pt-4 mt-4 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono uppercase text-slate-500 tracking-wider">Estimated Invoice Total</span>
                    <strong className="text-sm font-mono text-slate-900 font-black">
                      ${orderDraftItems.reduce((sum, draft) => {
                        const original = products.find(p => p.id === draft.productId);
                        return sum + (original ? original.price * draft.quantity : 0);
                      }, 0).toFixed(2)}
                    </strong>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button 
                      type="button"
                      onClick={() => setOrderModalOpen(false)}
                      className="cursor-pointer w-full bg-white hover:bg-slate-100 text-xs font-semibold py-2 rounded text-slate-600 border border-slate-200 transition-colors"
                    >
                      Dismiss
                    </button>
                    <button 
                      type="submit"
                      disabled={orderDraftItems.length === 0 || !selectedCustId}
                      className="cursor-pointer w-full bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-xs font-bold py-2 rounded text-white transition-colors tracking-wide uppercase font-mono shadow"
                    >
                      Process Order
                    </button>
                  </div>
                </div>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
