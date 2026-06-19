import { useState, useEffect } from 'react';
import type { Dish, Order, DiscountCodes, Settings } from '../types';
import { saveDish, deleteDishDB, updateOrderStatus, saveDiscountCode, deleteDiscountCodeDB, saveSettings as saveSettingsDB, subscribeToOrders } from '../lib/db';
import { isSupabaseConfigured } from '../lib/supabase';

// ---- AdminDashboard ----
const AdminDashboard = ({
  dishes,
  setDishes,
  orders,
  setOrders,
  discountCodes,
  setDiscountCodes,
  settings,
  setSettings,
  onLogout,
  onCloseAdmin,
}: {
  dishes: Dish[];
  setDishes: (d: Dish[]) => void;
  orders: Order[];
  setOrders: (o: Order[] | ((prev: Order[]) => Order[])) => void;
  discountCodes: DiscountCodes;
  setDiscountCodes: (d: DiscountCodes) => void;
  settings: Settings;
  setSettings: (s: Settings) => void;
  onLogout: () => void;
  onCloseAdmin: () => void;
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDish, setNewDish] = useState<Dish>({
    id: 0, title: '', category: 'Sandwich', price: 100, dietary: 'non-veg',
    image: '', inStock: true,
  });
  const [loaderBg, setLoaderBg] = useState(settings.loaderBg || '');
  const [storyImg, setStoryImg] = useState(settings.storyImg || '');

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

  // Real-time order subscription
  useEffect(() => {
    const { unsubscribe } = subscribeToOrders(
      (newOrder) => {
        // Play notification sound for admin
        try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+Af39/gH9/f4B/f3+Af39/gH9/f4B/f3+Af39/gH9/f4B/f3+Af39/gH9/f4B/f3+Af39/gH9/f4B/f3+Af39/gH9/f4B/f3+Af39/gH9/f4B/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/').play(); } catch {}
        setOrders((prev) => [newOrder, ...prev]);
      },
      (updatedOrder) => {
        setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      }
    );
    return () => unsubscribe();
  }, []);

  const updateOrderStatusHandler = async (id: number, status: string) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    await updateOrderStatus(id, status);
  };

  const toggleStock = async (id: number) => {
    const dish = dishes.find((d) => d.id === id);
    if (!dish) return;
    const updated = { ...dish, inStock: !dish.inStock };
    setDishes(dishes.map((d) => (d.id === id ? updated : d)));
    await saveDish(updated, false);
  };

  const addDish = async () => {
    const id = Date.now();
    const dish = { ...newDish, id };
    setDishes([...dishes, dish]);
    setShowAddForm(false);
    await saveDish(dish, true);
  };

  const saveDishEdit = async () => {
    if (editingDish) {
      setDishes(dishes.map((d) => (d.id === editingDish.id ? editingDish : d)));
      await saveDish(editingDish, false);
    }
    setEditingDish(null);
  };

  const deleteDish = async (id: number) => {
    setDishes(dishes.filter((d) => d.id !== id));
    await deleteDishDB(id);
  };

  const saveSettings = async () => {
    const newSettings = { loaderBg, storyImg };
    setSettings(newSettings);
    localStorage.setItem('ck_settings', JSON.stringify(newSettings));
    await saveSettingsDB(newSettings);
    alert('Settings saved!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const filteredOrders = orders.filter(
    (o) =>
      !search ||
      o.id.toString().includes(search) ||
      (o.customer?.name || '').toLowerCase().includes(search.toLowerCase())
  );
  const filteredDishes = dishes.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex bg-obsidian text-cream">
      {/* Sidebar */}
      <div className="w-64 bg-obsidian border-r border-gold/10 flex flex-col">
        <div className="p-6 font-display text-2xl font-bold text-gold">
          CK<span className="text-cream">Admin</span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {['dashboard', 'dishes', 'orders', 'discounts', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3 capitalize ${activeTab === tab ? 'bg-gold/20 text-gold' : 'text-cream/60 hover:text-cream'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gold/10">
          <div className="flex items-center gap-2 mb-3 text-xs">
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-green-400 animate-pulse' : 'bg-rose'}`}></span>
            <span className={isSupabaseConfigured ? 'text-green-400' : 'text-rose'}>
              {isSupabaseConfigured ? 'Supabase Live' : 'Supabase Offline'}
            </span>
          </div>
          <button
            onClick={() => { onLogout(); onCloseAdmin(); }}
            className="text-sm text-cream/50 hover:text-gold w-full text-left"
          >
            Logout & Return to Site
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-obsidian/60 border border-gold/10 rounded-2xl p-5">
              <p className="text-xs text-cream/40">Revenue</p>
              <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-obsidian/60 border border-gold/10 rounded-2xl p-5">
              <p className="text-xs text-cream/40">Orders</p>
              <p className="text-3xl font-bold">{totalOrders}</p>
            </div>
            <div className="bg-obsidian/60 border border-gold/10 rounded-2xl p-5">
              <p className="text-xs text-cream/40">Avg Order</p>
              <p className="text-3xl font-bold">₹{avgOrderValue}</p>
            </div>
          </div>
        )}

        {activeTab === 'dishes' && (
          <>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Dishes ({filteredDishes.length})</h2>
              <div className="flex gap-2">
                <input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-2 bg-obsidian border border-gold/20 rounded-xl text-sm"
                />
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-gold text-obsidian rounded-xl font-semibold"
                >
                  + Add Dish
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDishes.map((d) => (
                <div key={d.id} className="bg-obsidian/60 border border-gold/10 rounded-xl p-4 flex justify-between items-start">
                  <div className="flex gap-3">
                    <img src={d.image} alt={d.title} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold">{d.title}</p>
                      <p className="text-xs text-cream/40">
                        ₹{d.price} · {d.category} · {d.dietary}
                      </p>
                      <button
                        onClick={() => toggleStock(d.id)}
                        className={`text-xs ${d.inStock ? 'text-sage-light' : 'text-rose'}`}
                      >
                        {d.inStock ? 'In Stock' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingDish({ ...d })} className="text-xs text-gold hover:underline">Edit</button>
                    <button onClick={() => deleteDish(d.id)} className="text-xs text-rose hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Orders</h2>
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 bg-obsidian border border-gold/20 rounded-xl text-sm"
              />
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-gold/10">
                <tr>
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-right p-4">Total</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders
                  .slice()
                  .reverse()
                  .map((o) => (
                    <tr key={o.id} className="border-t border-gold/5">
                      <td className="p-4 font-mono text-gold">{o.id}</td>
                      <td className="p-4">{o.customer?.name}</td>
                      <td className="p-4 text-cream/60">
                        {new Date(o.created_at).toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-semibold">₹{o.total}</td>
                      <td className="p-4">
                        <select
                          value={o.status || 'Processing'}
                          onChange={(e) => updateOrderStatusHandler(o.id, e.target.value)}
                          className="bg-obsidian border border-gold/20 rounded px-2 py-1 text-xs"
                        >
                          <option>Processing</option>
                          <option>Out for Delivery</option>
                          <option>Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === 'discounts' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Discount Codes</h2>
            <div className="flex gap-2 mb-4">
              <input
                placeholder="Code"
                id="discCode"
                className="px-4 py-2 bg-obsidian border border-gold/20 rounded-xl flex-1"
              />
              <input
                type="number"
                placeholder="% Off"
                id="discPercent"
                className="px-4 py-2 bg-obsidian border border-gold/20 rounded-xl w-24"
              />
              <button
                onClick={async () => {
                  const code = (document.getElementById('discCode') as HTMLInputElement).value.toUpperCase();
                  const pct = parseFloat((document.getElementById('discPercent') as HTMLInputElement).value);
                  if (code && !isNaN(pct)) {
                    setDiscountCodes({ ...discountCodes, [code]: pct });
                    await saveDiscountCode(code, pct);
                  }
                }}
                className="px-4 py-2 bg-gold text-obsidian rounded-xl font-semibold"
              >
                Add
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-gold/10">
                <tr>
                  <th className="text-left p-4">Code</th>
                  <th className="text-center p-4">Discount</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(discountCodes).map(([code, pct]) => (
                  <tr key={code} className="border-t border-gold/5">
                    <td className="p-4 font-mono text-gold">{code}</td>
                    <td className="p-4 text-center">{pct}%</td>
                    <td className="p-4">
                      <button
                        onClick={async () => {
                          const newCodes = { ...discountCodes };
                          delete newCodes[code];
                          setDiscountCodes(newCodes);
                          await deleteDiscountCodeDB(code);
                        }}
                        className="text-xs text-rose hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">Site Settings</h2>
            <div className="space-y-6">
              <div className="bg-obsidian/60 border border-gold/10 rounded-2xl p-5">
                <h3 className="font-display text-lg font-semibold mb-3">Loading Screen Background</h3>
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      placeholder="Image URL"
                      value={loaderBg}
                      onChange={(e) => setLoaderBg(e.target.value)}
                      className="w-full p-2 bg-obsidian border border-gold/20 rounded"
                    />
                    <label className="bg-gold/10 text-gold px-3 py-1.5 rounded-xl cursor-pointer inline-block text-sm">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, setLoaderBg)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {loaderBg && (
                    <img src={loaderBg} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-gold/20" />
                  )}
                </div>
              </div>
              <div className="bg-obsidian/60 border border-gold/10 rounded-2xl p-5">
                <h3 className="font-display text-lg font-semibold mb-3">Our Story Image</h3>
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      placeholder="Image URL"
                      value={storyImg}
                      onChange={(e) => setStoryImg(e.target.value)}
                      className="w-full p-2 bg-obsidian border border-gold/20 rounded"
                    />
                    <label className="bg-gold/10 text-gold px-3 py-1.5 rounded-xl cursor-pointer inline-block text-sm">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, setStoryImg)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {storyImg && (
                    <img src={storyImg} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-gold/20" />
                  )}
                </div>
              </div>
              <button
                onClick={saveSettings}
                className="px-8 py-3 bg-gold text-obsidian rounded-xl font-semibold hover:bg-gold-dark transition"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Dish Modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowAddForm(false)}
        >
          <div
            className="bg-obsidian border border-gold/20 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">New Dish</h3>
            <input
              placeholder="Title"
              value={newDish.title}
              onChange={(e) => setNewDish({ ...newDish, title: e.target.value })}
              className="w-full p-2 bg-obsidian border rounded mb-2"
            />
            <select
              value={newDish.category}
              onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
              className="w-full p-2 bg-obsidian border rounded mb-2"
            >
              <option>Sandwich</option><option>Burger</option><option>Fries</option>
              <option>Pizza</option><option>Wrap</option><option>Sliders / Sides</option>
              <option>Milkshake</option><option>Mojito</option>
            </select>
            <input
              type="number"
              placeholder="Price"
              value={newDish.price}
              onChange={(e) => setNewDish({ ...newDish, price: parseInt(e.target.value) })}
              className="w-full p-2 bg-obsidian border rounded mb-2"
            />
            <select
              value={newDish.dietary}
              onChange={(e) => setNewDish({ ...newDish, dietary: e.target.value as 'veg' | 'non-veg' })}
              className="w-full p-2 bg-obsidian border rounded mb-2"
            >
              <option>veg</option><option>non-veg</option>
            </select>
            <input
              placeholder="Image URL"
              value={newDish.image}
              onChange={(e) => setNewDish({ ...newDish, image: e.target.value })}
              className="w-full p-2 bg-obsidian border rounded mb-4"
            />
            <button
              onClick={addDish}
              className="w-full py-2 bg-gold text-obsidian rounded-xl font-semibold"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Edit Dish Modal */}
      {editingDish && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setEditingDish(null)}
        >
          <div
            className="bg-obsidian border border-gold/20 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Edit Dish</h3>
            <input
              value={editingDish.title}
              onChange={(e) => setEditingDish({ ...editingDish, title: e.target.value })}
              className="w-full p-2 bg-obsidian border rounded mb-2"
            />
            <select
              value={editingDish.category}
              onChange={(e) => setEditingDish({ ...editingDish, category: e.target.value })}
              className="w-full p-2 bg-obsidian border rounded mb-2"
            >
              <option>Sandwich</option><option>Burger</option><option>Fries</option>
              <option>Pizza</option><option>Wrap</option><option>Sliders / Sides</option>
              <option>Milkshake</option><option>Mojito</option>
            </select>
            <input
              type="number"
              value={editingDish.price}
              onChange={(e) => setEditingDish({ ...editingDish, price: parseInt(e.target.value) })}
              className="w-full p-2 bg-obsidian border rounded mb-2"
            />
            <select
              value={editingDish.dietary}
              onChange={(e) => setEditingDish({ ...editingDish, dietary: e.target.value as 'veg' | 'non-veg' })}
              className="w-full p-2 bg-obsidian border rounded mb-2"
            >
              <option>veg</option><option>non-veg</option>
            </select>
            <input
              value={editingDish.image}
              onChange={(e) => setEditingDish({ ...editingDish, image: e.target.value })}
              className="w-full p-2 bg-obsidian border rounded mb-4"
            />
            <button
              onClick={saveDishEdit}
              className="w-full py-2 bg-gold text-obsidian rounded-xl font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- AdminPanel (with auth) ----
export const AdminPanel = ({
  dishes,
  setDishes,
  orders,
  setOrders,
  discountCodes,
  setDiscountCodes,
  settings,
  setSettings,
  onCloseAdmin,
}: {
  dishes: Dish[];
  setDishes: (d: Dish[]) => void;
  orders: Order[];
  setOrders: (o: Order[] | ((prev: Order[]) => Order[])) => void;
  discountCodes: DiscountCodes;
  setDiscountCodes: (d: DiscountCodes) => void;
  settings: Settings;
  setSettings: (s: Settings) => void;
  onCloseAdmin: () => void;
}) => {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [adminPass, setAdminPass] = useState(() => localStorage.getItem('ck_admin_pass') || '');
  const [setup, setSetup] = useState(!adminPass);
  const [newPass, setNewPass] = useState('');

  const handleLogin = () => {
    if (pass === adminPass) setAuth(true);
  };
  const handleSetup = () => {
    if (newPass.length >= 4) {
      localStorage.setItem('ck_admin_pass', newPass);
      setAdminPass(newPass);
      setSetup(false);
      setAuth(true);
    }
  };
  const handleLogout = () => setAuth(false);

  if (!auth) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90">
        <button
          onClick={onCloseAdmin}
          className="absolute top-4 left-4 p-2 rounded-full bg-obsidian/60 hover:bg-obsidian text-cream/70 hover:text-cream transition z-10"
        >
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <div className="bg-obsidian border border-gold/20 rounded-2xl p-8 w-full max-w-sm mx-4">
          {setup ? (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-cream">Set Admin Password</h3>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full p-3 bg-obsidian border border-gold/30 rounded-xl text-cream"
                placeholder="New password"
              />
              <button
                onClick={handleSetup}
                className="w-full py-3 bg-gold text-obsidian rounded-xl font-semibold"
              >
                Set Password
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-cream">Admin Login</h3>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full p-3 bg-obsidian border border-gold/30 rounded-xl text-cream"
                placeholder="Password"
              />
              <button
                onClick={handleLogin}
                className="w-full py-3 bg-gold text-obsidian rounded-xl font-semibold"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <AdminDashboard
      dishes={dishes}
      setDishes={setDishes}
      orders={orders}
      setOrders={setOrders}
      discountCodes={discountCodes}
      setDiscountCodes={setDiscountCodes}
      settings={settings}
      setSettings={setSettings}
      onLogout={handleLogout}
      onCloseAdmin={onCloseAdmin}
    />
  );
};
