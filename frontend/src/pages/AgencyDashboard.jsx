import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building, Calendar, DollarSign, Activity, FileSpreadsheet, Play, Power, ExternalLink, RefreshCw, Copy, Check, Info, Settings, Edit3, Image, ShieldAlert, CheckCircle, Trash2, AlertTriangle, CreditCard, History, LogOut, Mail, MessageSquare, Eye, Server, Search, MapPin, Bell, Printer } from 'lucide-react';
import { agencyApi } from '../api/client';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export default function AgencyDashboard() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    orders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  
  // Search and Location filter states
  const [searchName, setSearchName] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const filteredRestaurants = restaurants.filter((res) => {
    const nameMatch = (res.name || '').toLowerCase().includes(searchName.toLowerCase().trim());
    const locationMatch = (res.location || '').toLowerCase().includes(filterLocation.toLowerCase().trim());
    return nameMatch && locationMatch;
  });

  // Agency Logo, Name, URL State
  const [logoUrl, setLogoUrl] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [agencyUrl, setAgencyUrl] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Agency Contact & Social State
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  });
  const [savingSocials, setSavingSocials] = useState(false);

  // Applications state
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Delete confirmation state: { [restaurantId]: { countdown: number, timer: any } }
  const [deleteState, setDeleteState] = useState({});

  // New restaurant creation form state
  const [formData, setFormData] = useState({
    name: '',
    tableCount: 8,
    logo_url: '',
    description: '',
    logout_redirect_url: '',
    login_theme_color: '#fafaf9',
    location: '',
    contact_email: '',
    contact_phone: '',
    pins: {
      admin: 'admin123',
      waiter: '2222',
      counter: '3333',
      cashier: '4444',
      customer: '0000',
    },
  });

  const [newRestaurantResult, setNewRestaurantResult] = useState(null);

  // Edit restaurant state
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    logo_url: '',
    description: '',
    logout_redirect_url: '',
    login_theme_color: '#fafaf9',
    location: '',
    contact_email: '',
    contact_phone: '',
    pins: {
      admin: '',
      waiter: '',
      counter: '',
      cashier: '',
      customer: '',
    }
  });

  // Billing Tab Search and Filter states
  const [billingSearchName, setBillingSearchName] = useState('');
  const [billingFilterLocation, setBillingFilterLocation] = useState('');
  const [billingFilterPlan, setBillingFilterPlan] = useState('');
  const [billingFilterDate, setBillingFilterDate] = useState('');

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('tenants'); // 'tenants' | 'billing' | 'inquiries' | 'settings'

  // Subscription management state
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [subFormData, setSubFormData] = useState({
    planName: 'Bronze Plan',
    price: 999,
    billingCycle: 'Monthly',
    status: 'Trial',
    startDate: '',
    nextBillingDate: '',
  });

  // Payment history log state
  const [viewingPayments, setViewingPayments] = useState(null);
  const [payFormData, setPayFormData] = useState({
    amount: '',
    planName: 'Bronze Plan',
    method: 'UPI',
    transactionId: '',
    status: 'Paid',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Inquiries state
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // SMTP / Email settings state
  const [smtpSettings, setSmtpSettings] = useState({
    admin_email: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: false,
  });
  const [savingSmtp, setSavingSmtp] = useState(false);

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPw, setChangingPw] = useState(false);

  // WordPress-style Blog states
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogFormData, setBlogFormData] = useState({
    title: '',
    summary: '',
    content: '',
    author: 'Bhoj360 Team',
    image_url: ''
  });

  const fetchBlogs = async () => {
    setLoadingBlogs(true);
    try {
      const { data } = await agencyApi.get('/blogs');
      setBlogs(data);
    } catch (err) {
      toast.error('Failed to load blogs');
    } finally {
      setLoadingBlogs(false);
    }
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    if (!blogFormData.title || !blogFormData.content) {
      toast.error('Title and content are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = editingBlog ? { ...blogFormData, id: editingBlog.id } : blogFormData;
      await agencyApi.post('/blogs', payload);
      toast.success(editingBlog ? 'Blog post updated!' : 'Blog post created!');
      setEditingBlog(null);
      setBlogFormData({ title: '', summary: '', content: '', author: 'Bhoj360 Team', image_url: '' });
      fetchBlogs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save blog');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogFormData({
      title: blog.title || '',
      summary: blog.summary || '',
      content: blog.content || '',
      author: blog.author || 'Bhoj360 Team',
      image_url: blog.image_url || ''
    });
  };

  const handleDeleteBlog = async (id) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      try {
        await agencyApi.delete(`/blogs/${id}`);
        toast.success('Blog post deleted successfully');
        fetchBlogs();
      } catch (err) {
        toast.error('Failed to delete blog');
      }
    }
  };

  const handleStartEditSubscription = (res) => {
    setEditingSubscription(res);
    setSubFormData({
      planName: res.subscription?.planName || 'Bronze Plan',
      price: res.subscription?.price || 999,
      billingCycle: res.subscription?.billingCycle || 'Monthly',
      status: res.subscription?.status || 'Trial',
      startDate: res.subscription?.startDate || new Date().toISOString().split('T')[0],
      nextBillingDate: res.subscription?.nextBillingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  const handleEditSubscriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await agencyApi.put(`/restaurants/${editingSubscription.id}/subscription`, subFormData);
      toast.success('Subscription plan updated successfully!');
      setEditingSubscription(null);
      fetchRestaurants();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartViewingPayments = (res) => {
    setViewingPayments(res);
    setPayFormData({
      amount: res.subscription?.price || '',
      planName: res.subscription?.planName || 'Bronze Plan',
      method: 'UPI',
      transactionId: '',
      status: 'Paid',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleLogPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payFormData.amount) {
      toast.error('Amount is required');
      return;
    }
    try {
      setSubmitting(true);
      const { data } = await agencyApi.post(`/restaurants/${viewingPayments.id}/payments`, payFormData);
      toast.success('Payment logged successfully!');
      
      // Update local state for viewingPayments
      const updatedPayments = [...(viewingPayments.paymentHistory || []), data.payment];
      setViewingPayments(prev => ({
        ...prev,
        paymentHistory: updatedPayments
      }));
      
      // Reset form
      setPayFormData({
        amount: viewingPayments.subscription?.price || '',
        planName: viewingPayments.subscription?.planName || 'Bronze Plan',
        method: 'UPI',
        transactionId: '',
        status: 'Paid',
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });
      
      fetchRestaurants();
    } catch (err) {
      console.error(err);
      toast.error('Failed to log payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendInvoice = async (res) => {
    if (!res.contact_email) {
      if (confirm('This restaurant does not have a contact email configured. Would you like to configure it now?')) {
        handleStartEdit(res);
      }
      return;
    }
    try {
      toast.loading('Sending invoice...', { id: 'send-invoice-toast' });
      await agencyApi.post(`/restaurants/${res.id}/send-invoice`);
      toast.success(`Invoice sent to ${res.contact_email}`, { id: 'send-invoice-toast' });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to send invoice', { id: 'send-invoice-toast' });
    }
  };

  const handleSendReminder = async (res) => {
    if (!res.contact_email) {
      if (confirm('This restaurant does not have a contact email registered. Would you like to configure it now?')) {
        handleStartEdit(res);
      }
      return;
    }
    try {
      toast.loading('Sending payment reminder...', { id: 'send-reminder-toast' });
      await agencyApi.post(`/restaurants/${res.id}/send-reminder`);
      toast.success(`Reminder sent to ${res.contact_email}`, { id: 'send-reminder-toast' });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to send reminder', { id: 'send-reminder-toast' });
    }
  };

  const getPlanBreakdown = () => {
    const plans = {};
    restaurants.forEach((r) => {
      const sub = r.subscription || {};
      const status = (sub.status || '').toLowerCase();
      const planName = sub.planName || 'Bronze Plan';
      if (!plans[planName]) {
        plans[planName] = { active: 0, trial: 0, mrr: 0, collected: 0 };
      }
      if (status === 'active') {
        plans[planName].active++;
        const price = Number(sub.price) || 0;
        if (sub.billingCycle === 'Monthly') plans[planName].mrr += price;
        else if (sub.billingCycle === 'Quarterly') plans[planName].mrr += price / 3;
        else if (sub.billingCycle === 'Annually') plans[planName].mrr += price / 12;
      } else if (status === 'trial') {
        plans[planName].trial++;
      }
      if (r.paymentHistory && Array.isArray(r.paymentHistory)) {
        r.paymentHistory.forEach((p) => {
          if (p.status === 'Paid') {
            plans[planName].collected += Number(p.amount) || 0;
          }
        });
      }
    });
    return plans;
  };

  const filteredBillingRestaurants = restaurants.filter((res) => {
    const sub = res.subscription || {};
    const nameMatch = (res.name || '').toLowerCase().includes(billingSearchName.toLowerCase().trim());
    const locationMatch = (res.location || '').toLowerCase().includes(billingFilterLocation.toLowerCase().trim());
    const planMatch = (sub.planName || '').toLowerCase().includes(billingFilterPlan.toLowerCase().trim());
    
    let dateMatch = true;
    if (billingFilterDate) {
      const targetDate = billingFilterDate.trim();
      const nextDue = sub.nextBillingDate || '';
      const start = sub.startDate || '';
      const matchesDueOrStart = nextDue.includes(targetDate) || start.includes(targetDate);
      
      let matchesHistory = false;
      if (res.paymentHistory && Array.isArray(res.paymentHistory)) {
        matchesHistory = res.paymentHistory.some(p => (p.date || '').includes(targetDate));
      }
      dateMatch = matchesDueOrStart || matchesHistory;
    }
    
    return nameMatch && locationMatch && planMatch && dateMatch;
  });

  const getBillingStats = () => {
    let mrr = 0;
    let totalCollected = 0;
    let trialCount = 0;
    let activeCount = 0;
    let pastDueCount = 0;

    restaurants.forEach((r) => {
      const sub = r.subscription || {};
      const status = (sub.status || '').toLowerCase();
      const price = Number(sub.price) || 0;

      if (status === 'trial') {
        trialCount++;
      } else if (status === 'active') {
        activeCount++;
        if (sub.billingCycle === 'Monthly') {
          mrr += price;
        } else if (sub.billingCycle === 'Quarterly') {
          mrr += price / 3;
        } else if (sub.billingCycle === 'Annually') {
          mrr += price / 12;
        }
      } else if (status === 'past due' || status === 'past_due') {
        pastDueCount++;
      }

      if (r.paymentHistory && Array.isArray(r.paymentHistory)) {
        r.paymentHistory.forEach((p) => {
          if (p.status === 'Paid') {
            totalCollected += Number(p.amount) || 0;
          }
        });
      }
    });

    return { mrr, totalCollected, trialCount, activeCount, pastDueCount };
  };

  const billingStats = getBillingStats();

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const { data } = await agencyApi.get('/restaurants');
      const list = data.restaurants || [];
      setRestaurants(list);

      // Aggregate overall stats
      let activeCount = 0;
      let totalOrders = 0;

      const detailedPromises = list.map(async (r) => {
        if (!r.active) return r;
        try {
          const statsRes = await agencyApi.get(`/restaurants/${r.id}/stats`);
          const summary = statsRes.data;
          totalOrders += summary.ordersCount || 0;
          if (r.online) activeCount++;
          return { ...r, stats: summary };
        } catch {
          return r;
        }
      });

      const resolved = await Promise.all(detailedPromises);
      setRestaurants(resolved);

      // Compute total collected from subscriptions
      let totalSubsCollected = 0;
      resolved.forEach((r) => {
        if (r.paymentHistory && Array.isArray(r.paymentHistory)) {
          r.paymentHistory.forEach((p) => {
            if (p.status === 'Paid') {
              totalSubsCollected += Number(p.amount) || 0;
            }
          });
        }
      });

      setStats({
        total: list.length,
        active: activeCount || list.filter((x) => x.online).length,
        orders: totalOrders,
        revenue: totalSubsCollected,
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load agency restaurants');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencySettings = async () => {
    try {
      const { data } = await agencyApi.get('/agency/settings');
      setLogoUrl(data.logo_url || '');
      setAgencyName(data.agency_name || '');
      setAgencyUrl(data.agency_url || '');
      setWhatsappNumber(data.whatsapp_number || '');
      setSocialLinks(data.social_links || { facebook: '', twitter: '', instagram: '', linkedin: '' });
      // Load SMTP/email settings
      setSmtpSettings(prev => ({
        ...prev,
        admin_email: data.admin_email || '',
        smtp_host: data.smtp_host || '',
        smtp_port: String(data.smtp_port || '587'),
        smtp_user: data.smtp_user || '',
        smtp_secure: data.smtp_secure || false,
        // Note: smtp_pass is never returned from backend for security
      }));
    } catch (err) {
      console.warn('Failed to load agency settings', err);
    }
  };

  const fetchApplications = async () => {
    setLoadingApplications(true);
    try {
      const { data } = await agencyApi.get('/applications');
      setApplications(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load job applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleDeleteApplication = async (id) => {
    if (confirm('Are you sure you want to delete this job application?')) {
      try {
        await agencyApi.delete(`/applications/${id}`);
        setApplications(prev => prev.filter(app => app.id !== id));
        if (selectedApplication?.id === id) setSelectedApplication(null);
        toast.success('Application deleted successfully');
      } catch (err) {
        toast.error('Failed to delete application');
      }
    }
  };

  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const { data } = await agencyApi.get('/inquiries');
      setInquiries(data.inquiries || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load inquiries');
    } finally {
      setLoadingInquiries(false);
    }
  };

  const handleMarkRead = async (inquiry) => {
    if (inquiry.read) return;
    try {
      await agencyApi.patch(`/inquiries/${inquiry.id}/read`);
      setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, read: true } : i));
      if (selectedInquiry?.id === inquiry.id) {
        setSelectedInquiry(prev => ({ ...prev, read: true }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInquiry = async (id) => {
    try {
      await agencyApi.delete(`/inquiries/${id}`);
      setInquiries(prev => prev.filter(i => i.id !== id));
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
      toast.success('Inquiry deleted');
    } catch (err) {
      toast.error('Failed to delete inquiry');
    }
  };

  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    setSavingSmtp(true);
    try {
      await agencyApi.put('/agency/settings', {
        logo_url: logoUrl,
        agency_name: agencyName,
        agency_url: agencyUrl,
        admin_email: smtpSettings.admin_email,
        smtp_host: smtpSettings.smtp_host,
        smtp_port: Number(smtpSettings.smtp_port),
        smtp_user: smtpSettings.smtp_user,
        smtp_pass: smtpSettings.smtp_pass,
        smtp_secure: smtpSettings.smtp_secure,
      });
      toast.success('Email / SMTP settings saved!');
      setSmtpSettings(prev => ({ ...prev, smtp_pass: '' })); // Clear pass from form for security
    } catch (err) {
      toast.error('Failed to save SMTP settings');
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setChangingPw(true);
    try {
      await agencyApi.post('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  const handleLogout = async () => {
    try {
      await agencyApi.post('/auth/logout');
    } catch (_) {}
    localStorage.removeItem('agency_token');
    navigate('/app/login', { replace: true });
  };

  useEffect(() => {
    fetchRestaurants();
    fetchAgencySettings();
  }, [activeTab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Restaurant name is required');
      return;
    }
    try {
      setSubmitting(true);
      const { data } = await agencyApi.post('/restaurants', formData);
      setNewRestaurantResult(data);
      toast.success('Restaurant created successfully!');
      fetchRestaurants();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create restaurant');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await agencyApi.put(`/restaurants/${editingRestaurant.id}`, {
        name: editFormData.name,
        logo_url: editFormData.logo_url,
        description: editFormData.description,
        logout_redirect_url: editFormData.logout_redirect_url,
        login_theme_color: editFormData.login_theme_color,
        location: editFormData.location,
        contact_email: editFormData.contact_email,
        contact_phone: editFormData.contact_phone,
        pins: editFormData.pins,
      });
      toast.success('Restaurant updated successfully!');
      setEditingRestaurant(null);
      fetchRestaurants();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update restaurant details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAgencyLogo = async (e) => {
    e.preventDefault();
    if (whatsappNumber && !/^\d{10}$/.test(whatsappNumber.trim())) {
      toast.error('WhatsApp number must be exactly 10 digits.');
      return;
    }
    try {
      setSavingSettings(true);
      await agencyApi.put('/agency/settings', { 
        logo_url: logoUrl, 
        agency_name: agencyName, 
        agency_url: agencyUrl,
        whatsapp_number: whatsappNumber.trim(),
        social_links: socialLinks
      });
      toast.success('Agency settings saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDelete = (res) => {
    const id = res.id;
    const existing = deleteState[id];

    if (existing && existing.countdown === 0) {
      // Confirmed — proceed with deletion
      clearInterval(existing.timer);
      setDeleteState(prev => { const s = { ...prev }; delete s[id]; return s; });
      agencyApi.delete(`/restaurants/${id}`)
        .then(() => {
          toast.success(`"${res.name}" deleted permanently`);
          fetchRestaurants();
        })
        .catch((err) => {
          console.error(err);
          toast.error('Failed to delete restaurant');
        });
      return;
    }

    if (existing) return; // Already in countdown, ignore repeated clicks

    // Start 5-second countdown
    let count = 5;
    setDeleteState(prev => ({ ...prev, [id]: { countdown: count, timer: null } }));
    const timer = setInterval(() => {
      count -= 1;
      setDeleteState(prev => {
        if (!prev[id]) { clearInterval(timer); return prev; }
        if (count <= 0) {
          return { ...prev, [id]: { countdown: 0, timer } };
        }
        return { ...prev, [id]: { countdown: count, timer } };
      });
    }, 1000);
    setDeleteState(prev => ({ ...prev, [id]: { countdown: count, timer } }));
  };

  const handleCancelDelete = (id) => {
    setDeleteState(prev => {
      if (prev[id]?.timer) clearInterval(prev[id].timer);
      const s = { ...prev }; delete s[id]; return s;
    });
  };

  const handleToggleBlock = async (res) => {
    const nextActive = !res.active;
    const actionText = nextActive ? 'activate' : 'block/deactivate';
    if (confirm(`Are you sure you want to ${actionText} "${res.name}"?`)) {
      try {
        await agencyApi.put(`/restaurants/${res.id}`, { active: nextActive });
        toast.success(`Tenant ${nextActive ? 'activated' : 'blocked/stopped'}`);
        fetchRestaurants();
      } catch (err) {
        console.error(err);
        toast.error('Failed to update tenant status');
      }
    }
  };

  const handleToggleOnline = async (res) => {
    const nextOnline = !res.online;
    try {
      await agencyApi.put(`/restaurants/${res.id}`, { online: nextOnline });
      toast.success(`Service status set to ${nextOnline ? 'ONLINE' : 'OFFLINE'}`);
      fetchRestaurants();
    } catch (err) {
      console.error(err);
      toast.error('Failed to change service status');
    }
  };

  const handleStartEdit = (res) => {
    setEditingRestaurant(res);
    setEditFormData({
      name: res.name || '',
      logo_url: res.logo_url || '',
      description: res.description || '',
      logout_redirect_url: res.logout_redirect_url || '',
      login_theme_color: res.login_theme_color || '#fafaf9',
      location: res.location || '',
      contact_email: res.contact_email || '',
      contact_phone: res.contact_phone || '',
      pins: {
        admin: res.pins?.admin || 'admin123',
        waiter: res.pins?.waiter || '2222',
        counter: res.pins?.counter || '3333',
        cashier: res.pins?.cashier || '4444',
        customer: res.pins?.customer || '0000',
      }
    });
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Restaurant ID copied!');
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setNewRestaurantResult(null);
    setFormData({
      name: '',
      tableCount: 8,
      logo_url: '',
      description: '',
      logout_redirect_url: '',
      login_theme_color: '#fafaf9',
      location: '',
      pins: {
        admin: '1111',
        waiter: '2222',
        counter: '3333',
        cashier: '4444',
        customer: '0000',
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10 font-body">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Agency Logo" className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200 shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-display font-black text-xl text-white shadow-md">
              A
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-905 tracking-wide">{agencyName || 'Restaurant Agency'}</h1>
            <p className="text-xs text-slate-500 mt-0.5">SaaS Platform Operator Control Room</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchRestaurants(); fetchAgencySettings(); }}
            className="p-2.5 bg-white hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 border border-slate-200 transition-colors shadow-xs"
            title="Refresh List"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Restaurant</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2.5 bg-white hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 transition-colors shadow-xs"
            title="Logout"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 mb-8 flex-wrap">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'tenants'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          Tenants & Services
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'billing'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          Subscriptions & Billing
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'inquiries'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Inquiries
          {inquiries.filter(i => !i.read).length > 0 && (
            <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {inquiries.filter(i => !i.read).length > 9 ? '9+' : inquiries.filter(i => !i.read).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'applications'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Job Applications
          {applications.length > 0 && (
            <span className="ml-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {applications.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Settings
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'blog'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          Blog Manager
        </button>
      </div>

      {activeTab === 'tenants' && (
        <>
          {/* Agency settings & global stats grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column Settings */}
        <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Settings className="w-4.5 h-4.5 text-blue-605" /> Agency Branding Settings
          </h3>
          <form onSubmit={handleSaveAgencyLogo} className="space-y-4">
            {/* Agency Name */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Agency Name</label>
              <input
                type="text"
                placeholder="e.g. FoodTech Solutions"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
              />
              <p className="text-[9px] text-slate-400 mt-1">Shown as "Built by [Agency Name]" on restaurant login pages.</p>
            </div>
            {/* Agency Website URL */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Agency Website URL</label>
              <input
                type="url"
                placeholder="https://youragency.com"
                value={agencyUrl}
                onChange={(e) => setAgencyUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
              />
              <p className="text-[9px] text-slate-400 mt-1">Clicking the built-by credit on login pages will open this URL.</p>
            </div>
            {/* Agency Logo URL */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Agency Logo URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Image className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-550 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  {savingSettings ? 'Saving...' : 'Save'}
                </button>
              </div>
              <p className="text-[9px] text-slate-400 mt-1">This optional logo will automatically render on the headers of all tenant dashboards.</p>
            </div>
          </form>
        </div>

        {/* Right Columns: Stats Counters */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total SaaS Nodes</span>
              <p className="text-xl font-bold font-mono text-slate-800 mt-0.5">{stats.total}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Active Services</span>
              <p className="text-xl font-bold font-mono text-slate-800 mt-0.5">{stats.active}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Orders Handled</span>
              <p className="text-xl font-bold font-mono text-slate-800 mt-0.5">{stats.orders}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Agency Revenue</span>
              <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">₹{stats.revenue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurants List */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-bold font-display text-slate-805 flex items-center gap-2">
          Registered SaaS Tenants
        </h2>

        {/* Search and Filter Inputs */}
        {restaurants.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div className="relative w-full sm:w-60">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                placeholder="Filter by location..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-56 rounded-3xl bg-white border border-slate-200" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl text-slate-450 max-w-xl mx-auto shadow-xs">
          <Building className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-base font-semibold text-slate-600">No Restaurants Registered Yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Click "Add Restaurant" to spin up a new isolated service and database instance.</p>
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl text-slate-450 max-w-xl mx-auto shadow-xs">
          <Search className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-base font-semibold text-slate-600">No Match Found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">No restaurants match your search query or location filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((res) => {
            const isOnline = res.online;
            return (
              <div
                key={res.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-slate-300 shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  {/* Status & ID badges */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded border border-blue-100">
                      {res.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        res.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {res.active ? 'ACTIVE' : 'BLOCKED'}
                      </span>
                      <button
                        onClick={() => handleToggleOnline(res)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold hover:opacity-85 active:scale-95 transition-all ${
                          isOnline ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        }`}
                        title={isOnline ? 'Switch to OFFLINE' : 'Switch to ONLINE'}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-rose-500'}`} />
                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                      </button>
                    </div>
                  </div>

                  {/* Name and Logo */}
                  <div className="flex items-start gap-3 mt-1">
                    {res.logo_url ? (
                      <img src={res.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-display font-black text-lg shrink-0">
                        {res.name ? res.name[0].toUpperCase() : 'R'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold font-display text-slate-800 tracking-tight truncate">
                        {res.name}
                      </h3>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-[10px] text-slate-400 font-mono tracking-wider">
                        <span>Port: {res.port}</span>
                        {res.location && (
                          <span className="text-indigo-600 font-bold">📍 {res.location}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {res.description && (
                    <p className="text-xs text-slate-500 mt-3 line-clamp-2 italic">
                      "{res.description}"
                    </p>
                  )}

                  {res.logout_redirect_url && (
                    <span className="text-[9px] text-indigo-500 font-mono tracking-tight block mt-1.5 truncate" title={res.logout_redirect_url}>
                      Logout Redirect: {res.logout_redirect_url}
                    </span>
                  )}

                  {/* Live Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Today Sales</span>
                      <p className="text-xs font-bold font-mono text-emerald-600 mt-0.5">
                        ₹{res.stats?.revenue || 0}
                      </p>
                    </div>
                    <div className="text-center border-x border-slate-100 px-1">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Orders</span>
                      <p className="text-xs font-bold font-mono text-slate-700 mt-0.5">
                        {res.stats?.ordersCount || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Turnover</span>
                      <p className="text-xs font-bold font-mono text-indigo-650 mt-0.5">
                        {res.stats?.tableTurnover || '0%'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-450 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {res.createdAt ? format(parseISO(res.createdAt), 'dd MMM yyyy') : 'No Date'}
                    </span>

                    <button
                      onClick={() => handleStartEdit(res)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-600 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Edit Tenant"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleBlock(res)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors border ${
                          res.active
                            ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                            : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{res.active ? 'Block Tenant' : 'Activate'}</span>
                      </button>

                      <a
                        href={`/r/${res.id}/login`}
                        className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isOnline && res.active
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
                        }`}
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Delete section */}
                  {deleteState[res.id] ? (
                    <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        {deleteState[res.id].countdown > 0 ? (
                          <p className="text-[10px] text-red-700 font-semibold leading-tight">
                            Deleting in {deleteState[res.id].countdown}s… Click Confirm now to proceed!
                          </p>
                        ) : (
                          <p className="text-[10px] text-red-700 font-semibold leading-tight">
                            All data will be permanently erased!
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(res)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors flex-shrink-0 ${
                          deleteState[res.id].countdown === 0
                            ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 animate-pulse'
                            : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                        }`}
                      >
                        {deleteState[res.id].countdown === 0 ? 'CONFIRM' : 'Wait...'}
                      </button>
                      <button
                        onClick={() => handleCancelDelete(res.id)}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors flex-shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDelete(res)}
                      className="w-full py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-red-100 bg-red-50/60 text-red-500 hover:bg-red-100 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Restaurant</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Billing Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Estimated MRR</span>
                <p className="text-xl font-bold font-mono text-indigo-600 mt-0.5">₹{billingStats.mrr.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Collections</span>
                <p className="text-xl font-bold font-mono text-emerald-650 mt-0.5">₹{billingStats.totalCollected.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Active / Trial plans</span>
                <p className="text-xl font-bold font-mono text-slate-800 mt-0.5">
                  <span className="text-green-600">{billingStats.activeCount}</span>
                  <span className="text-slate-300 mx-1">/</span>
                  <span className="text-blue-650">{billingStats.trialCount}</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-650 flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Past Due Invoices</span>
                <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{billingStats.pastDueCount}</p>
              </div>
            </div>
          </div>

          {/* Plan Category Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Subscription Plans Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(getPlanBreakdown()).map(([planName, planStats]) => (
                <div key={planName} className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded uppercase tracking-wider inline-block mb-2">{planName}</span>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-2xl font-extrabold text-slate-800 font-mono">{planStats.active + planStats.trial}</span>
                      <span className="text-xs text-slate-400">({planStats.active} Active / {planStats.trial} Trial)</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>MRR: ₹{planStats.mrr.toLocaleString('en-IN')}</span>
                    <span className="text-emerald-600 font-bold">Collected: ₹{planStats.collected.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
              {Object.keys(getPlanBreakdown()).length === 0 && (
                <div className="col-span-full py-6 text-center text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-3xl shadow-sm">
                  No subscriptions allocated yet.
                </div>
              )}
            </div>
          </div>

          {/* Billing Search and Filters */}
          <div className="bg-white border border-slate-200 p-5 rounded-3xl grid grid-cols-1 sm:grid-cols-4 gap-4 shadow-sm">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Search Restaurant</label>
              <input
                type="text"
                value={billingSearchName}
                onChange={(e) => setBillingSearchName(e.target.value)}
                placeholder="Restaurant name..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Filter by Location</label>
              <input
                type="text"
                value={billingFilterLocation}
                onChange={(e) => setBillingFilterLocation(e.target.value)}
                placeholder="Location..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Filter by Plan</label>
              <input
                type="text"
                value={billingFilterPlan}
                onChange={(e) => setBillingFilterPlan(e.target.value)}
                placeholder="e.g. Bronze, Silver..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Filter by Date</label>
              <input
                type="date"
                value={billingFilterDate}
                onChange={(e) => setBillingFilterDate(e.target.value)}
                className="w-full px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 font-display text-base">Subscription Plan Allocations</h3>
              <p className="text-xs text-slate-400">Matching Tenants: {filteredBillingRestaurants.length} / {restaurants.length}</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Restaurant</th>
                    <th className="px-6 py-4">Subscription Plan</th>
                    <th className="px-6 py-4">Billing Rate</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Dates</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredBillingRestaurants.map((res) => {
                    const subRaw = res.subscription || {};
                    const sub = {
                      planName: subRaw.planName || 'Bronze Plan',
                      price: subRaw.price !== undefined ? subRaw.price : 999,
                      billingCycle: subRaw.billingCycle || 'Monthly',
                      status: subRaw.status || 'Trial',
                      startDate: subRaw.startDate || 'N/A',
                      nextBillingDate: subRaw.nextBillingDate || 'N/A',
                    };
                    const statusColors = {
                      Active: 'bg-green-50 text-green-700 border-green-205',
                      Trial: 'bg-blue-50 text-blue-700 border-blue-205',
                      'Past Due': 'bg-amber-50 text-amber-700 border-amber-205',
                      Suspended: 'bg-slate-100 text-slate-606 border-slate-250',
                    };
                    const statusClass = statusColors[sub.status] || 'bg-slate-50 text-slate-650 border-slate-200';
 
                    return (
                      <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {res.logo_url ? (
                              <img src={res.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold font-display">
                                {res.name ? res.name[0].toUpperCase() : 'R'}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-850 flex items-center gap-1.5">
                                <span>{res.name}</span>
                                {res.location && <span className="text-[10px] text-slate-450 font-normal">📍 {res.location}</span>}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{res.id}</div>
                              {res.contact_email && <div className="text-[9px] text-slate-400 mt-0.5 font-mono">{res.contact_email}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-700">{sub.planName}</div>
                          <div className="text-[10px] text-slate-400">{sub.billingCycle} Cycle</div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-800">
                          ₹{Number(sub.price).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}>
                            {sub.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[11px] text-slate-500 font-mono">
                          <div>Start: {sub.startDate || 'N/A'}</div>
                          <div className="mt-1 text-slate-400">Next Due: {sub.nextBillingDate || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleSendInvoice(res)}
                              className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold flex items-center gap-1 transition-colors border border-emerald-150 text-[10px]"
                              title="Send invoice via email"
                            >
                              <Mail className="w-3 h-3" />
                              <span>Inv</span>
                            </button>
                            <button
                              onClick={() => handleSendReminder(res)}
                              className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-semibold flex items-center gap-1 transition-colors border border-amber-150 text-[10px]"
                              title="Send payment reminder"
                            >
                              <Bell className="w-3 h-3" />
                              <span>Remind</span>
                            </button>
                            <button
                              onClick={() => handleStartEditSubscription(res)}
                              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-lg font-semibold flex items-center gap-1 transition-colors border border-slate-200 text-[10px]"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Plan</span>
                            </button>
                            <button
                              onClick={() => handleStartViewingPayments(res)}
                              className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold flex items-center gap-1 transition-colors border border-blue-150 text-[10px]"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span>Pay Log</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredBillingRestaurants.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-450 bg-slate-50/50">
                        No restaurant matching your criteria found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Restaurant Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={handleCloseModal} />

          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-slide-up overflow-hidden max-h-[90vh] flex flex-col text-slate-800">
            <h2 className="text-xl font-bold font-display text-slate-900 mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Spin up SaaS Tenant Node
            </h2>

            {newRestaurantResult ? (
              <div className="space-y-6 overflow-y-auto">
                <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl flex items-center gap-3 text-emerald-800">
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Tenant instance created successfully!</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Microservice processes have been spawned.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      REST_ID (Required for login)
                    </span>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-mono font-bold text-blue-600">{newRestaurantResult.id}</span>
                      <button
                        onClick={() => handleCopy(newRestaurantResult.id)}
                        className="ml-auto text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        {copiedId === newRestaurantResult.id ? <Check className="w-4.5 h-4.5 text-green-600" /> : <Copy className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Instance Defaults Table & PIN Codes
                    </span>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-700">
                      <div>
                        <span className="text-slate-400 text-[10px] block">ADMIN PIN</span>
                        <span className="text-slate-800 font-bold">{newRestaurantResult.pins.admin}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">WAITER PIN</span>
                        <span className="text-slate-800 font-bold">{newRestaurantResult.pins.waiter}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">COUNTER PIN</span>
                        <span className="text-slate-800 font-bold">{newRestaurantResult.pins.counter}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">CASHIER PIN</span>
                        <span className="text-slate-800 font-bold">{newRestaurantResult.pins.cashier}</span>
                      </div>
                      <div className="col-span-2 mt-2 pt-2 border-t border-slate-200/60">
                        <span className="text-slate-400 text-[10px] block">CUSTOMER PORTAL</span>
                        <span className="text-slate-800 font-bold">Tables default seed ({newRestaurantResult.pins.customer})</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-550 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4 overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Punjabi Tadka"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                    Location / City (e.g. Delhi, Mumbai)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Delhi NCR"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                      placeholder="owner@restaurant.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="e.g. +91-9876543210"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                    Default Table Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formData.tableCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, tableCount: parseInt(e.target.value) || 8 }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                    Restaurant Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                    Restaurant Description / Information
                  </label>
                  <textarea
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief details about cuisine, seating, graphics, etc."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                    Customer Logout Redirect URL
                  </label>
                  <input
                    type="url"
                    value={formData.logout_redirect_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logout_redirect_url: e.target.value }))}
                    placeholder="https://yourwebsite.com/goodbye"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                    Login Page Theme Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.login_theme_color || '#fafaf9'}
                      onChange={(e) => setFormData(prev => ({ ...prev, login_theme_color: e.target.value }))}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 bg-white p-0.5"
                    />
                    <input
                      type="text"
                      value={formData.login_theme_color || '#fafaf9'}
                      onChange={(e) => setFormData(prev => ({ ...prev, login_theme_color: e.target.value }))}
                      placeholder="#fafaf9"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1.5">Background tint for the restaurant's login page (lighter colors recommended).</p>
                </div>

                <div className="border-t border-slate-150 pt-4 mt-2">
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-3">
                    Admin Login Credentials
                  </h4>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Initial Admin Password *</label>
                    <input
                      type="text"
                      required
                      value={formData.pins.admin}
                      onChange={(e) => setFormData(prev => ({ ...prev, pins: { ...prev.pins, admin: e.target.value } }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-850 text-base"
                      placeholder="e.g. admin123"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Set the initial alphanumeric password for logging in to the Restaurant Admin portal.</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-505 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm flex items-center gap-1.5"
                  >
                    {submitting ? 'Creating instance...' : 'Register Restaurant'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {editingRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setEditingRestaurant(null)} />

          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-slide-up overflow-hidden max-h-[90vh] flex flex-col text-slate-800">
            <h2 className="text-xl font-bold font-display text-slate-900 mb-6 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" />
              Edit SaaS Tenant Configuration
            </h2>

            <form onSubmit={handleEditSubmit} className="space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                  Location / City (e.g. Delhi, Mumbai)
                </label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.contact_email}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="owner@restaurant.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editFormData.contact_phone}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="e.g. +91-9876543210"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                  Restaurant Logo URL
                </label>
                <input
                  type="url"
                  value={editFormData.logo_url}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                  Restaurant Description / Information
                </label>
                <textarea
                  rows="2"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief details about cuisine, seating, graphics, etc."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                  Customer Logout Redirect URL
                </label>
                <input
                  type="url"
                  value={editFormData.logout_redirect_url}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, logout_redirect_url: e.target.value }))}
                  placeholder="https://yourwebsite.com/goodbye"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                  Login Page Theme Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editFormData.login_theme_color || '#fafaf9'}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, login_theme_color: e.target.value }))}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 bg-white p-0.5"
                  />
                  <input
                    type="text"
                    value={editFormData.login_theme_color || '#fafaf9'}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, login_theme_color: e.target.value }))}
                    placeholder="#fafaf9"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1.5">Background tint for the restaurant's login page (lighter colors recommended).</p>
              </div>

              <div className="border-t border-slate-150 pt-4 mt-2">
                <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-3">
                  Admin Login Credentials
                </h4>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Admin Password *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.pins.admin}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, pins: { ...prev.pins, admin: e.target.value } }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-850 text-base"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Set the alphanumeric password for logging in to the Restaurant Admin portal.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRestaurant(null)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-505 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                >
                  {submitting ? 'Saving changes...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {editingSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setEditingSubscription(null)} />

          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-slide-up overflow-hidden max-h-[90vh] flex flex-col text-slate-800">
            <h2 className="text-xl font-bold font-display text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Manage Subscription Plan
            </h2>

            <form onSubmit={handleEditSubscriptionSubmit} className="space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                  Plan Name
                </label>
                <select
                  value={subFormData.planName}
                  onChange={(e) => setSubFormData(prev => ({ ...prev, planName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Bronze Plan">Bronze Plan</option>
                  <option value="Silver Plan">Silver Plan</option>
                  <option value="Gold Plan">Gold Plan</option>
                  <option value="Custom Plan">Custom Plan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                    Pricing Rate (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={subFormData.price}
                    onChange={(e) => setSubFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                    Billing Cycle
                  </label>
                  <select
                    value={subFormData.billingCycle}
                    onChange={(e) => setSubFormData(prev => ({ ...prev, billingCycle: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                  Plan Status
                </label>
                <select
                  value={subFormData.status}
                  onChange={(e) => setSubFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Trial">Trial (Free Mode)</option>
                  <option value="Active">Active (Paid & In Good Standing)</option>
                  <option value="Past Due">Past Due (Payment Pending)</option>
                  <option value="Suspended">Suspended (Service Blocked)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={subFormData.startDate}
                    onChange={(e) => setSubFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={subFormData.nextBillingDate}
                    onChange={(e) => setSubFormData(prev => ({ ...prev, nextBillingDate: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSubscription(null)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-505 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
                >
                  {submitting ? 'Updating...' : 'Save Plan Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History & Logger Modal */}
      {viewingPayments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setViewingPayments(null)} />

          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-slide-up overflow-hidden max-h-[90vh] flex flex-col text-slate-800">
            <h2 className="text-xl font-bold font-display text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
              <History className="w-5 h-5 text-blue-600" />
              <span>Billing Logs: {viewingPayments.name}</span>
            </h2>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-5 gap-6 pr-1">
              {/* Left Form: Add payment */}
              <div className="md:col-span-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between max-h-[480px]">
                <form onSubmit={handleLogPaymentSubmit} className="space-y-3.5">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Log New Payment</h3>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Payment Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={payFormData.amount}
                      onChange={(e) => setPayFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g. 999"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Plan Name</label>
                    <input
                      type="text"
                      required
                      value={payFormData.planName}
                      onChange={(e) => setPayFormData(prev => ({ ...prev, planName: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Payment Method</label>
                      <select
                        value={payFormData.method}
                        onChange={(e) => setPayFormData(prev => ({ ...prev, method: e.target.value }))}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="Stripe">Stripe</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Payment Date</label>
                      <input
                        type="date"
                        required
                        value={payFormData.date}
                        onChange={(e) => setPayFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Transaction/Ref ID</label>
                    <input
                      type="text"
                      value={payFormData.transactionId}
                      onChange={(e) => setPayFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g. TXN-12345"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Notes</label>
                    <textarea
                      rows="2"
                      value={payFormData.notes}
                      onChange={(e) => setPayFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Add billing comments..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    {submitting ? 'Logging...' : 'Record Payment'}
                  </button>
                </form>
              </div>

              {/* Right List: Payments list */}
              <div className="md:col-span-3 flex flex-col max-h-[480px]">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Collected Payments History</h3>
                
                <div className="flex-1 border border-slate-200 rounded-2xl overflow-y-auto bg-slate-50 p-2 space-y-2.5">
                  {(!viewingPayments.paymentHistory || viewingPayments.paymentHistory.length === 0) ? (
                    <div className="text-center py-20 text-slate-450">
                      <CreditCard className="w-8 h-8 mx-auto text-slate-350 mb-2 opacity-50" />
                      <p className="text-xs font-medium">No payments logged yet.</p>
                    </div>
                  ) : (
                    [...viewingPayments.paymentHistory].reverse().map((pay) => (
                      <div key={pay.id} className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 border border-slate-150 rounded">
                              {pay.id}
                            </span>
                            <div className="text-xs font-bold text-slate-800 mt-2">{pay.planName}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold font-mono text-emerald-600">
                              +₹{pay.amount.toLocaleString('en-IN')}
                            </span>
                            <div className="text-[9px] text-slate-400 mt-1 font-mono">{pay.date}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2.5 mt-2.5 text-[10px] text-slate-500">
                          <div>
                            <span className="text-slate-400 block uppercase tracking-wide">Method</span>
                            <span className="font-semibold text-slate-700">{pay.method}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block uppercase tracking-wide">Ref ID</span>
                            <span className="font-mono text-slate-700 truncate block" title={pay.transactionId}>
                              {pay.transactionId || 'None'}
                            </span>
                          </div>
                        </div>

                        {pay.notes && (
                          <div className="mt-2 text-[10px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-150/50 italic">
                            "{pay.notes}"
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print History</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingPayments(null)}
                className="px-5 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ INQUIRIES TAB ═══ */}
      {activeTab === 'inquiries' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Inquiries list */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" /> Contact Inquiries
              </h3>
              <button onClick={fetchInquiries} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            {loadingInquiries ? (
              <div className="p-8 text-center text-sm text-slate-400">Loading inquiries...</div>
            ) : inquiries.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No inquiries yet</p>
                <p className="text-xs text-slate-300 mt-1">Submissions from the contact form will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
                {inquiries.map((inq) => (
                  <button
                    key={inq.id}
                    onClick={() => { setSelectedInquiry(inq); handleMarkRead(inq); }}
                    className={`w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors ${selectedInquiry?.id === inq.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!inq.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                          <span className={`text-sm font-semibold truncate ${!inq.read ? 'text-slate-800' : 'text-slate-600'}`}>
                            {inq.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mb-1">{inq.subject}</p>
                        <p className="text-xs text-slate-400 truncate">{inq.email}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 mt-0.5">
                        {format(parseISO(inq.createdAt), 'MMM d')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Inquiry detail */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
            {!selectedInquiry ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <Eye className="w-10 h-10 text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">Select an inquiry to view details</p>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-1">{selectedInquiry.subject}</h2>
                    <p className="text-xs text-slate-400">{format(parseISO(selectedInquiry.createdAt), 'PPpp')}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedInquiry.read ? (
                      <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg font-semibold">Read</span>
                    ) : (
                      <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg font-semibold">Unread</span>
                    )}
                    <button
                      onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">From</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedInquiry.name}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    <a href={`mailto:${selectedInquiry.email}`} className="text-sm font-semibold text-blue-600 hover:underline">{selectedInquiry.email}</a>
                  </div>
                  {selectedInquiry.phone && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-sm font-semibold text-slate-800">{selectedInquiry.phone}</p>
                    </div>
                  )}
                  {selectedInquiry.company && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Company</p>
                      <p className="text-sm font-semibold text-slate-800">{selectedInquiry.company}</p>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-3">Message</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>

                {/* Ref */}
                <p className="text-[10px] text-slate-300 mt-4 font-mono">Ref: {selectedInquiry.id}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ SETTINGS TAB ═══ */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email / SMTP Settings */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" /> Email & SMTP Settings
            </h3>
            <form onSubmit={handleSaveSmtp} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Admin Email (receives 2FA codes)</label>
                <input
                  type="email"
                  placeholder="admin@youragency.com"
                  value={smtpSettings.admin_email}
                  onChange={(e) => setSmtpSettings(p => ({ ...p, admin_email: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">SMTP Host</label>
                  <input
                    type="text"
                    placeholder="smtp.gmail.com"
                    value={smtpSettings.smtp_host}
                    onChange={(e) => setSmtpSettings(p => ({ ...p, smtp_host: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Port</label>
                  <input
                    type="number"
                    placeholder="587"
                    value={smtpSettings.smtp_port}
                    onChange={(e) => setSmtpSettings(p => ({ ...p, smtp_port: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">SMTP Username</label>
                <input
                  type="email"
                  placeholder="your-email@gmail.com"
                  value={smtpSettings.smtp_user}
                  onChange={(e) => setSmtpSettings(p => ({ ...p, smtp_user: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">SMTP Password / App Password</label>
                <input
                  type="password"
                  placeholder="Leave empty to keep existing password"
                  value={smtpSettings.smtp_pass}
                  onChange={(e) => setSmtpSettings(p => ({ ...p, smtp_pass: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                />
                <p className="text-[9px] text-slate-400 mt-1">For Gmail: use an App Password (not your main password). Generate at myaccount.google.com/apppasswords</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="smtp-secure"
                  checked={smtpSettings.smtp_secure}
                  onChange={(e) => setSmtpSettings(p => ({ ...p, smtp_secure: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="smtp-secure" className="text-xs text-slate-600">Use SSL/TLS (port 465)</label>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSmtp}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {savingSmtp ? 'Saving...' : 'Save Email Settings'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-500" /> Change Admin Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Current Password</label>
                <input
                  type="password"
                  placeholder="Your current password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPw}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {changingPw ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Agency Contact & Social Links */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 lg:col-span-2">
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" /> Agency Contact & Social Links
            </h3>
            <form onSubmit={handleSaveAgencyLogo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">WhatsApp Support Number (10 digits)</label>
                  <input
                    type="tel"
                    placeholder="e.g. 8299443154"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">This number will be linked on the "Chat with us" icons across the platform.</p>
                </div>
                
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Facebook Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/yourpage"
                    value={socialLinks.facebook || ''}
                    onChange={(e) => setSocialLinks(p => ({ ...p, facebook: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Twitter / X Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://twitter.com/yourpage"
                    value={socialLinks.twitter || ''}
                    onChange={(e) => setSocialLinks(p => ({ ...p, twitter: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Instagram Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/yourpage"
                    value={socialLinks.instagram || ''}
                    onChange={(e) => setSocialLinks(p => ({ ...p, instagram: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">LinkedIn Page URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/company/yourpage"
                    value={socialLinks.linkedin || ''}
                    onChange={(e) => setSocialLinks(p => ({ ...p, linkedin: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>

                <div className="pt-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50"
                  >
                    {savingSettings ? 'Saving...' : 'Save Social & Contact Links'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ BLOG MANAGER TAB ═══ */}
      {activeTab === 'blog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Blog Editor (Left Column) */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-slate-100">
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-500" />
                {editingBlog ? 'Edit Blog Post' : 'Create New Post'}
              </h3>
              {editingBlog && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingBlog(null);
                    setBlogFormData({ title: '', summary: '', content: '', author: 'Bhoj360 Team', image_url: '' });
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <form onSubmit={handleBlogSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Post Title</label>
                <input
                  type="text"
                  placeholder="e.g. How Bhoj360 Speeds Up Table Service"
                  value={blogFormData.title}
                  onChange={(e) => setBlogFormData(p => ({ ...p, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Author</label>
                <input
                  type="text"
                  placeholder="e.g. Bhoj360 Team"
                  value={blogFormData.author}
                  onChange={(e) => setBlogFormData(p => ({ ...p, author: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Featured Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={blogFormData.image_url}
                  onChange={(e) => setBlogFormData(p => ({ ...p, image_url: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Short Summary / Excerpt</label>
                <textarea
                  rows={3}
                  placeholder="A brief overview of this post to show in listings..."
                  value={blogFormData.summary}
                  onChange={(e) => setBlogFormData(p => ({ ...p, summary: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Post Content (HTML Supported)</label>
                <textarea
                  rows={10}
                  placeholder="<p>Write your article body here...</p>"
                  value={blogFormData.content}
                  onChange={(e) => setBlogFormData(p => ({ ...p, content: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-400 transition-colors font-mono"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingBlog ? 'Update Post' : 'Publish Blog Post'}
                </button>
              </div>
            </form>
          </div>

          {/* Published Blogs (Right Column) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-500" /> Published Articles ({blogs.length})
            </h3>
            {loadingBlogs ? (
              <div className="flex justify-center py-20 text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-slate-400 text-xs">No blog posts found. Publish your first article!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <div key={blog.id} className="p-4 border border-slate-100 rounded-2xl hover:border-slate-200 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex gap-4 items-center flex-1">
                      {blog.image_url ? (
                        <img src={blog.image_url} alt={blog.title} className="w-14 h-14 rounded-xl object-cover border border-slate-100" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold uppercase">
                          B360
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 line-clamp-1">{blog.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">By {blog.author} • {blog.published_at ? format(parseISO(blog.published_at), 'MMM dd, yyyy') : 'Draft'}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{blog.summary || 'No excerpt available.'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleStartEditBlog(blog)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                        title="Edit Post"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ JOB APPLICATIONS TAB ═══ */}
      {activeTab === 'applications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications list (Left Panel) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-500" /> Incoming Job Applications ({applications.length})
            </h3>
            {loadingApplications ? (
              <div className="flex justify-center py-20 text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-slate-400 text-xs">No job applications received yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div 
                    key={app.id} 
                    onClick={() => setSelectedApplication(app)}
                    className={`p-4 border rounded-2xl cursor-pointer transition-all flex justify-between items-center ${
                      selectedApplication?.id === app.id 
                        ? 'border-blue-500 bg-blue-50/20 shadow-xs' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/30'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-900">{app.name}</h4>
                        <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 uppercase">
                          {app.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Email: {app.email} | Phone: {app.phone}</p>
                      <p className="text-[10px] text-slate-350 font-mono mt-1">Submitted: {format(parseISO(app.createdAt), 'MMM dd, yyyy h:mm a')}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteApplication(app.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Application Detail Viewer (Right Panel) */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl shadow-sm p-6 h-fit">
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" /> Application Details
            </h3>
            {!selectedApplication ? (
              <div className="text-center py-20 text-slate-450 border border-dashed border-slate-100 rounded-2xl">
                <Info className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs">Select an application from the list to view full candidate details and cover letter.</p>
              </div>
            ) : (
              <div className="space-y-5 text-left">
                <div>
                  <h4 className="font-bold text-base text-slate-800">{selectedApplication.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">{selectedApplication.id}</p>
                </div>

                <div className="space-y-3 border-t border-b border-slate-100 py-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-450">Position Applied:</span>
                    <strong className="text-slate-805 uppercase">{selectedApplication.role}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-450">Email:</span>
                    <a href={`mailto:${selectedApplication.email}`} className="text-blue-605 hover:underline">{selectedApplication.email}</a>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-450">Phone:</span>
                    <a href={`tel:${selectedApplication.phone}`} className="text-slate-707 font-semibold">{selectedApplication.phone}</a>
                  </div>
                  {selectedApplication.resumeLink && (
                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-slate-450">CV/Resume Link:</span>
                      <a 
                        href={selectedApplication.resumeLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-605 hover:underline flex items-center gap-1"
                      >
                        Open Link <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Cover Letter / Candidate Notes</p>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-707 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selectedApplication.coverLetter || 'No cover letter submitted.'}
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <a
                    href={`mailto:${selectedApplication.email}?subject=Regarding%20your%20Bhoj360%20application%20for%20${encodeURIComponent(selectedApplication.role)}`}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs text-center rounded-xl transition-all shadow-xs"
                  >
                    Reply by Email
                  </a>
                  <button
                    onClick={() => handleDeleteApplication(selectedApplication.id)}
                    className="px-3 py-2 bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-100 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCOPED CSS PRINT LAYOUT */}
      <style>{`
        #print-payments-history {
          display: none;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #print-payments-history, #print-payments-history * {
            visibility: visible;
          }
          #print-payments-history {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px;
          }
        }
      `}</style>

      {/* Hidden print container for billing history */}
      {viewingPayments && (
        <div id="print-payments-history">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>Subscription Payment History</h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
              <strong>Restaurant:</strong> {viewingPayments.name} ({viewingPayments.id})
            </p>
            {viewingPayments.location && (
              <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#555' }}>
                <strong>Location:</strong> {viewingPayments.location}
              </p>
            )}
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#777' }}>
              Printed on {new Date().toLocaleDateString()}
            </p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid black', textAlign: 'left', fontWeight: 'bold' }}>
                <th style={{ padding: '8px' }}>Payment ID</th>
                <th style={{ padding: '8px' }}>Date</th>
                <th style={{ padding: '8px' }}>Plan</th>
                <th style={{ padding: '8px' }}>Method</th>
                <th style={{ padding: '8px' }}>Txn Reference</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(!viewingPayments.paymentHistory || viewingPayments.paymentHistory.length === 0) ? (
                <tr>
                  <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#777' }}>
                    No payments logged.
                  </td>
                </tr>
              ) : (
                [...viewingPayments.paymentHistory].reverse().map((pay) => (
                  <tr key={pay.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{pay.id}</td>
                    <td style={{ padding: '8px' }}>{pay.date}</td>
                    <td style={{ padding: '8px' }}>{pay.planName}</td>
                    <td style={{ padding: '8px' }}>{pay.method}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{pay.transactionId || 'N/A'}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                      ₹{pay.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
