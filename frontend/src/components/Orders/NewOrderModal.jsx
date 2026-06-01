import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, Send } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function NewOrderModal({
  isOpen,
  onClose,
  onSubmit,
  restaurantId,
  tableId,
  tableNumber,
  existingOrderId = null,
  initialCustomerPhone = '',
}) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Mobile UI Tabs: 'menu' | 'cart'
  const [mobileTab, setMobileTab] = useState('menu');

  const api = createApi(restaurantId);

  // Load menu items
  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        const { data: items } = await api.get('/menu', { params: { available: 1 } });
        const { data: cats } = await api.get('/menu/categories');
        setMenuItems(items);
        setCategories(['All', ...cats]);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) {
      loadMenu();
      setCart([]);
      setNotes('');
      setCustomerPhone(initialCustomerPhone);
      setCustomerName('');
      setMobileTab('menu');
    }
  }, [restaurantId, isOpen, initialCustomerPhone]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.menu_item_id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.menu_item_id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [
        ...prev,
        {
          menu_item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: 1,
          notes: '',
        },
      ];
    });
    toast.success(`Added ${item.name} to cart`, { duration: 1000, id: `add-${item.id}` });
  };

  const updateQty = (itemId, amount) => {
    setCart((prev) =>
      prev
        .map((cartItem) => {
          if (cartItem.menu_item_id === itemId) {
            const nextQty = cartItem.quantity + amount;
            return nextQty > 0 ? { ...cartItem, quantity: nextQty } : null;
          }
          return cartItem;
        })
        .filter(Boolean)
    );
  };

  const updateItemNote = (itemId, noteText) => {
    setCart((prev) =>
      prev.map((cartItem) =>
        cartItem.menu_item_id === itemId ? { ...cartItem, notes: noteText } : cartItem
      )
    );
  };

  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getCartTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!existingOrderId) {
      const phoneClean = customerPhone.trim();
      if (!phoneClean) {
        toast.error('Customer phone number is required');
        return;
      }
      if (phoneClean.length !== 10) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }
    }
    onSubmit({
      table_id: tableId,
      table_number: tableNumber,
      items: cart,
      notes,
      customer_phone: customerPhone.trim(),
      customer_name: customerName.trim(),
    });
    onClose();
  };

  if (!isOpen) return null;

  const filteredItems = menuItems.filter(
    (item) => activeCategory === 'All' || item.category === activeCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Main Container */}
      <div className="relative w-full h-full sm:h-[90vh] sm:max-w-4xl bg-white border border-slate-200 rounded-none sm:rounded-3xl shadow-xl flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800">
              {existingOrderId ? `Add Items to Order #${existingOrderId}` : `New Order — Table ${tableNumber}`}
            </h2>
            <span className="text-xs text-slate-400 font-semibold font-mono uppercase tracking-wider block mt-0.5">
              Role: Waiter / Staff Entry
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden border-b border-slate-200 bg-white p-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('menu')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all ${
              mobileTab === 'menu'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                : 'text-slate-500'
            }`}
          >
            Menu Catalog
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('cart')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all relative ${
              mobileTab === 'cart'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                : 'text-slate-500'
            }`}
          >
            <span>View Cart</span>
            {getCartCount() > 0 && (
              <span className="ml-1.5 px-2 py-0.5 bg-amber-600 text-white rounded-full text-[9px] font-mono">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>

        {/* Content Split: Left Menu, Right Cart */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* Left panel: Menu items */}
          <div className={`flex-1 flex flex-col p-5 overflow-hidden border-b md:border-b-0 md:border-r border-slate-200 ${mobileTab === 'menu' ? 'flex' : 'hidden md:flex'}`}>
            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scroll-smooth flex-shrink-0 no-print">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Items grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton h-24" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No menu items found.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredItems.map((item) => {
                    const cartItem = cart.find((i) => i.menu_item_id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => addToCart(item)}
                        className="p-3 bg-slate-50 hover:bg-indigo-50/20 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-3 hover-lift group"
                      >
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-800 truncate group-hover:text-indigo-650 transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                          <span className="text-sm font-bold text-emerald-600 font-mono mt-1.5 block">
                            ₹{item.price}
                          </span>
                        </div>

                        {cartItem ? (
                          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                  e.stopPropagation();
                                  updateQty(item.id, -1);
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-mono font-bold text-slate-700 px-1">
                              {cartItem.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                  e.stopPropagation();
                                  updateQty(item.id, 1);
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-450 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-all flex-shrink-0">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Cart summary */}
          <div className={`w-full md:w-80 p-5 bg-slate-50/50 border-l border-slate-200 flex flex-col overflow-hidden flex-1 min-h-0 md:flex-initial md:flex-shrink-0 ${mobileTab === 'cart' ? 'flex' : 'hidden md:flex'}`}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4" /> Cart Details
              </span>
              <span className="font-mono text-xs px-2 py-0.5 bg-slate-200 border border-slate-300 text-slate-600 rounded-md">
                {getCartCount()} items
              </span>
            </h3>

            {/* Cart Items list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-sm py-10">
                  <p>Cart is empty.</p>
                  <p className="text-xs text-slate-400 mt-1">Tap menu items to add.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.menu_item_id} className="p-3 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-medium text-slate-800 text-sm block truncate">
                          {item.item_name}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 font-mono">
                          ₹{item.price}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateQty(item.menu_item_id, -item.quantity)}
                        className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
                      {/* Qty edit */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateQty(item.menu_item_id, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-105 border border-slate-200 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-slate-700 w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.menu_item_id, 1)}
                          className="w-6 h-6 rounded-lg bg-slate-105 border border-slate-200 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total */}
                      <span className="text-xs font-bold font-mono text-slate-600">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>

                    {/* Note input */}
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => updateItemNote(item.menu_item_id, e.target.value)}
                      placeholder="Special prep notes..."
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 transition-colors placeholder:text-slate-350"
                    />
                  </div>
                ))
              )}
            </div>

            {/* Customer Details (only for new orders) */}
            {!existingOrderId && (
              <div className="mt-4 flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Customer Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    pattern="[0-9]{10}"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 transition-colors font-mono placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}

            {/* General instructions */}
            <div className="mt-4 flex-shrink-0">
              <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Order-wide Notes</label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Allergy, seating details, wait time notices..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-300"
              />
            </div>

            {/* Summary & Submit */}
            <div className="mt-4 border-t border-slate-200 pt-4 flex-shrink-0">
              <div className="flex items-center justify-between text-sm font-semibold mb-4">
                <span className="text-slate-450">Total Price</span>
                <span className="text-xl font-bold font-mono text-emerald-600">₹{getCartTotal()}</span>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={cart.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-medium shadow-md transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Send className="w-4 h-4" />
                <span>{existingOrderId ? 'Confirm Items' : 'Send to Kitchen'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
