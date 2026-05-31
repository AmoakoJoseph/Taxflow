'use client';

import React, { useState, useEffect } from 'react';

// Custom SVG Icons inlined for 100% stability and zero dependency issues
const Icons = {
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Ledger: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/><path d="M6 14h10"/></svg>,
  Tax: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="12" x2="12" y1="3" y2="21"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="16" x2="16" y1="16" y2="16"/><line x1="8" x2="8" y1="8" y2="8"/><line x1="16" x2="8" y1="8" y2="16"/><line x1="8" x2="16" y1="8" y2="16"/></svg>,
  Reports: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  Profile: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Bot: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>,
  Warning: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
};

const API_BASE = typeof window !== 'undefined'
  ? (window.location.origin.includes('localhost') ? 'http://localhost:3001' : '/_backend')
  : 'http://localhost:3001';

export default function TaxflowApp() {
  // Navigation & Screens
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, ledger, taxes, reports, profile
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [authError, setAuthError] = useState('');

  // Auth Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [tin, setTin] = useState('');
  const [vatRegistered, setVatRegistered] = useState(true);
  const [industryType, setIndustryType] = useState('Services');

  // App Data State
  const [token, setToken] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [taxSummary, setTaxSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalPayroll: 0,
    netProfit: 0,
    vatBreakdown: { outputVat: 0, inputVat: 0, vatPayable: 0 },
    payeBreakdown: { totalPaye: 0 },
    whtBreakdown: { whtSuffered: 0, whtWithheld: 0, netWhtBalance: 0 },
    totalEstimatedTaxOwed: 0
  });

  // Sheet / Modal Controllers
  const [showAddTxSheet, setShowAddTxSheet] = useState(false);
  const [editingTxId, setEditingTxId] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);

  // Form Fields for new transaction
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txType, setTxType] = useState('income'); // income, expense, payroll
  const [txCategory, setTxCategory] = useState('Services'); // default

  // Live Calculator tab state
  const [calcBasicSalary, setCalcBasicSalary] = useState('2500');
  const [calcPayeResult, setCalcPayeResult] = useState(null);
  
  const [calcVatAmount, setCalcVatAmount] = useState('1000');
  const [calcVatResult, setCalcVatResult] = useState(null);

  const [calcWhtAmount, setCalcWhtAmount] = useState('5000');
  const [calcWhtCategory, setCalcWhtCategory] = useState('Services');
  const [calcWhtResult, setCalcWhtResult] = useState(null);

  // Filter for Ledger list
  const [ledgerFilter, setLedgerFilter] = useState('all');

  // AI Chat State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your Taxflow Assistant. Ask me any questions about Ghana Revenue Authority (GRA) filing requirements, VAT registration, or business recording!' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Initial Setup & Fallback Checking
  useEffect(() => {
    const savedToken = localStorage.getItem('taxflow_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    }
  }, []);

  // Sync calculations whenever basic inputs change
  useEffect(() => {
    runLiveCalculators();
  }, [calcBasicSalary, calcVatAmount, calcWhtAmount, calcWhtCategory, vatRegistered]);

  const runLiveCalculators = () => {
    // 1. PAYE payroll calculation
    const basic = parseFloat(calcBasicSalary) || 0;
    const ssnit = basic * 0.055;
    const chargeable = basic - ssnit;
    
    // Tiered monthly bands
    const monthlyBands = [
      { limit: 490, rate: 0 },
      { limit: 110, rate: 0.05 },
      { limit: 130, rate: 0.10 },
      { limit: 3166.67, rate: 0.175 },
      { limit: 16000, rate: 0.25 },
      { limit: 30520, rate: 0.30 },
      { limit: Infinity, rate: 0.35 },
    ];

    let tempChargeable = chargeable;
    let taxOwed = 0;
    const details = [];

    for (const band of monthlyBands) {
      if (tempChargeable <= 0) break;
      const taxable = Math.min(tempChargeable, band.limit);
      const tax = taxable * band.rate;
      if (taxable > 0) {
        taxOwed += tax;
        details.push({ rate: band.rate * 100, amount: taxable, tax });
      }
      tempChargeable -= taxable;
    }

    setCalcPayeResult({
      ssnit: Math.round(ssnit * 100) / 100,
      chargeable: Math.round(chargeable * 100) / 100,
      tax: Math.round(taxOwed * 100) / 100,
      net: Math.round((basic - ssnit - taxOwed) * 100) / 100,
      details
    });

    // 2. VAT Calculation
    const vatBase = parseFloat(calcVatAmount) || 0;
    const vatValue = vatRegistered ? vatBase * 0.20 : 0;
    setCalcVatResult({
      rate: vatRegistered ? '20%' : '0% (Unregistered)',
      vatAmount: Math.round(vatValue * 100) / 100,
      total: Math.round((vatBase + vatValue) * 100) / 100
    });

    // 3. Withholding Tax Calculation
    const whtBase = parseFloat(calcWhtAmount) || 0;
    let whtRate = 0;
    const cat = calcWhtCategory.toLowerCase();
    if (cat.includes('goods')) whtRate = 0.03;
    else if (cat.includes('works')) whtRate = 0.05;
    else if (cat.includes('services')) whtRate = 0.075;

    const whtVal = whtBase * whtRate;
    setCalcWhtResult({
      rate: `${whtRate * 100}%`,
      whtAmount: Math.round(whtVal * 100) / 100,
      netPayable: Math.round((whtBase - whtVal) * 100) / 100
    });
  };

  // Smart AI suggestion for transaction categorization as they type description
  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    setTxDescription(text);

    // Simple NLP rule engine for Ghanaian business categories
    const lowercase = text.toLowerCase();
    
    if (lowercase.includes('consult') || lowercase.includes('service') || lowercase.includes('audit') || lowercase.includes('contract')) {
      setTxType('income');
      setTxCategory('Services');
    } else if (lowercase.includes('rent') || lowercase.includes('office space') || lowercase.includes('lease')) {
      setTxType('expense');
      setTxCategory('Services (Rent)');
    } else if (lowercase.includes('paper') || lowercase.includes('print') || lowercase.includes('pen') || lowercase.includes('stationery') || lowercase.includes('goods')) {
      setTxType('expense');
      setTxCategory('Goods');
    } else if (lowercase.includes('salary') || lowercase.includes('wage') || lowercase.includes('payroll') || lowercase.includes('staff')) {
      setTxType('payroll');
      setTxCategory('Salaries');
    } else if (lowercase.includes('electricity') || lowercase.includes('water') || lowercase.includes('utility') || lowercase.includes('internet') || lowercase.includes('ecg')) {
      setTxType('expense');
      setTxCategory('Utilities');
    } else if (lowercase.includes('renovation') || lowercase.includes('repair') || lowercase.includes('building') || lowercase.includes('mason') || lowercase.includes('carpenter')) {
      setTxType('expense');
      setTxCategory('Works');
    } else if (lowercase.includes('sales') || lowercase.includes('client payment') || lowercase.includes('sold') || lowercase.includes('product')) {
      setTxType('income');
      setTxCategory('Goods');
    }
  };

  // Standalone simulated storage layer in case backend is offline
  const runSimulatedAuth = (action, payload) => {
    setOfflineMode(true);
    if (action === 'register') {
      const mockProfile = {
        id: 'simulated-user',
        email: payload.email,
        businessName: payload.businessName,
        tin: payload.tin,
        vatRegistered: payload.vatRegistered,
        industryType: payload.industryType
      };
      setUserProfile(mockProfile);
      setToken('simulated-token');
      setIsAuthenticated(true);
      
      const welcomeAlert = {
        id: 'welcome-alert',
        title: 'Welcome to Offline Demo! 📱',
        message: 'The NestJS backend server was not detected. Taxflow is now running in offline simulation mode, storing your details in browser localStorage.',
        date: new Date().toISOString().split('T')[0],
        read: false
      };
      setNotifications([welcomeAlert]);
      localStorage.setItem('taxflow_sim_user', JSON.stringify(mockProfile));
      localStorage.setItem('taxflow_sim_txs', JSON.stringify([]));
    } else {
      // Login
      const savedUser = localStorage.getItem('taxflow_sim_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setUserProfile(user);
        setIsAuthenticated(true);
        loadOfflineData();
      } else {
        setAuthError('Offline business profile not found. Please click Signup instead.');
      }
    }
  };

  const loadOfflineData = () => {
    const savedUser = JSON.parse(localStorage.getItem('taxflow_sim_user'));
    const savedTxs = JSON.parse(localStorage.getItem('taxflow_sim_txs')) || [];
    setUserProfile(savedUser);
    setTransactions(savedTxs);
    recalculateOfflineSummaries(savedUser, savedTxs);
  };

  const recalculateOfflineSummaries = (profile, txs) => {
    let income = 0, expense = 0, payroll = 0;
    let outVat = 0, inVat = 0;
    let totalPaye = 0;
    let whtSuf = 0, whtWith = 0;

    txs.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
        outVat += t.vatAmount;
        whtSuf += t.whtAmount;
      } else if (t.type === 'expense') {
        expense += t.amount;
        inVat += t.vatAmount;
        whtWith += t.whtAmount;
      } else if (t.type === 'payroll') {
        payroll += t.amount;
        totalPaye += t.payeAmount;
      }
    });

    const vatPayable = profile.vatRegistered ? Math.max(0, outVat - inVat) : 0;
    const taxOwed = vatPayable + totalPaye + whtWith;

    setTaxSummary({
      totalIncome: income,
      totalExpense: expense,
      totalPayroll: payroll,
      netProfit: income - expense - payroll,
      vatBreakdown: { outputVat: outVat, inputVat: inVat, vatPayable },
      payeBreakdown: { totalPaye },
      whtBreakdown: { whtSuffered: whtSuf, whtWithheld: whtWith, netWhtBalance: whtWith - whtSuf },
      totalEstimatedTaxOwed: taxOwed
    });
  };

  // HTTP API Methods speaking to NestJS Backend
  const fetchProfile = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        setVatRegistered(profile.vatRegistered);
        setIsAuthenticated(true);
        fetchTransactions(authToken);
        fetchNotifications(authToken);
        fetchTaxSummary(authToken);
      } else {
        localStorage.removeItem('taxflow_token');
      }
    } catch (err) {
      console.warn('API Offline, switching to simulation check.');
      loadOfflineData();
    }
  };

  const fetchTransactions = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE}/api/transactions`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const list = await response.json();
        setTransactions(list);
      }
    } catch (err) {
      setOfflineMode(true);
    }
  };

  const fetchNotifications = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const list = await response.json();
        setNotifications(list);
      }
    } catch (err) {}
  };

  const fetchTaxSummary = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE}/api/reports/summary`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const sum = await response.json();
        setTaxSummary(sum);
      }
    } catch (err) {}
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const payload = { email, password, businessName, tin, vatRegistered, industryType };
    
    if (isRegistering) {
      try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          // Trigger Login immediately
          const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const loginData = await loginRes.json();
          localStorage.setItem('taxflow_token', loginData.token);
          setToken(loginData.token);
          setUserProfile(loginData.user);
          setIsAuthenticated(true);
          fetchTransactions(loginData.token);
          fetchNotifications(loginData.token);
          fetchTaxSummary(loginData.token);
        } else {
          const errData = await response.json();
          setAuthError(errData.message || 'Registration failed');
        }
      } catch (err) {
        console.warn('NestJS Offline, booting client-side simulator.');
        runSimulatedAuth('register', payload);
      }
    } else {
      // Login
      try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (response.ok) {
          const loginData = await response.json();
          localStorage.setItem('taxflow_token', loginData.token);
          setToken(loginData.token);
          setUserProfile(loginData.user);
          setIsAuthenticated(true);
          fetchTransactions(loginData.token);
          fetchNotifications(loginData.token);
          fetchTaxSummary(loginData.token);
        } else {
          setAuthError('Invalid email or password. Please verify your credentials or create a profile.');
        }
      } catch (err) {
        console.warn('NestJS Offline, booting client-side simulator.');
        runSimulatedAuth('login', payload);
      }
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    const payload = {
      type: txType,
      amount: parseFloat(txAmount),
      category: txCategory,
      date: txDate,
      description: txDescription
    };

    if (offlineMode) {
      let vat = 0, paye = 0, wht = 0;
      const amt = payload.amount;
      if (txType === 'income') {
        vat = userProfile.vatRegistered ? amt * 0.20 : 0;
        wht = txCategory.includes('Services') ? amt * 0.075 : (txCategory.includes('Goods') ? amt * 0.03 : 0);
      } else if (txType === 'expense') {
        vat = userProfile.vatRegistered ? amt * 0.20 : 0;
        wht = txCategory.includes('Services') ? amt * 0.075 : (txCategory.includes('Goods') ? amt * 0.03 : 0);
      } else if (txType === 'payroll') {
        const ssnit = amt * 0.055;
        const chargeable = amt - ssnit;
        paye = Math.max(0, (chargeable - 490) * 0.1); // simple approximation for simulation
      }

      const mockTx = {
        id: editingTxId || `tx-${Date.now()}`,
        userId: 'simulated-user',
        vatAmount: Math.round(vat * 100) / 100,
        payeAmount: Math.round(paye * 100) / 100,
        whtAmount: Math.round(wht * 100) / 100,
        ...payload
      };

      let newTxs = [];
      if (editingTxId) {
        newTxs = transactions.map(t => t.id === editingTxId ? mockTx : t);
      } else {
        newTxs = [mockTx, ...transactions];
      }

      setTransactions(newTxs);
      localStorage.setItem('taxflow_sim_txs', JSON.stringify(newTxs));
      recalculateOfflineSummaries(userProfile, newTxs);
      
      setShowAddTxSheet(false);
      resetTxForm();
      return;
    }

    try {
      const url = editingTxId 
        ? `${API_BASE}/api/transactions/${editingTxId}` 
        : `${API_BASE}/api/transactions`;
      const method = editingTxId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchTransactions(token);
        fetchTaxSummary(token);
        setShowAddTxSheet(false);
        resetTxForm();
      }
    } catch (err) {
      alert('Error saving transaction to server.');
    }
  };

  const handleEditClick = (tx) => {
    setEditingTxId(tx.id);
    setTxAmount(tx.amount.toString());
    setTxDescription(tx.description);
    setTxDate(tx.date);
    setTxType(tx.type);
    setTxCategory(tx.category);
    setShowAddTxSheet(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (offlineMode) {
      const newTxs = transactions.filter(t => t.id !== id);
      setTransactions(newTxs);
      localStorage.setItem('taxflow_sim_txs', JSON.stringify(newTxs));
      recalculateOfflineSummaries(userProfile, newTxs);
      return;
    }

    if (!confirm('Are you sure you want to delete this recording?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchTransactions(token);
        fetchTaxSummary(token);
      }
    } catch (err) {}
  };

  const handleDismissNotification = async (id) => {
    if (offlineMode) {
      setNotifications(notifications.filter(n => n.id !== id));
      return;
    }

    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications(token);
    } catch (err) {}
  };

  const handleProfileUpdate = async (updatedVatRegistered) => {
    const nextStatus = typeof updatedVatRegistered === 'boolean' ? updatedVatRegistered : vatRegistered;
    const payload = {
      businessName: userProfile.businessName,
      tin: userProfile.tin,
      vatRegistered: nextStatus,
      industryType: userProfile.industryType
    };

    if (offlineMode) {
      const mockUpdated = { ...userProfile, vatRegistered: nextStatus };
      setUserProfile(mockUpdated);
      localStorage.setItem('taxflow_sim_user', JSON.stringify(mockUpdated));
      recalculateOfflineSummaries(mockUpdated, transactions);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const updated = await response.json();
        setUserProfile(updated);
        fetchTransactions(token);
        fetchTaxSummary(token);
      }
    } catch (err) {}
  };

  const resetTxForm = () => {
    setEditingTxId(null);
    setTxAmount('');
    setTxDescription('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setTxType('income');
    setTxCategory('Services');
  };

  // AI Chatbot Simple Reply Mechanism
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Answer logic based on keywords
    setTimeout(() => {
      const text = chatInput.toLowerCase();
      let reply = "I'm not completely sure about that aspect, but you can find more verified tax information directly on the Ghana Revenue Authority (GRA) portal: gra.gov.gh.";

      if (text.includes('tin') || text.includes('tax identification')) {
        reply = "A Taxpayer Identification Number (TIN) is a unique number issued to identify taxpayers. In Ghana, your Ghana Card PIN acts as your individual TIN, while corporate companies can register for a company TIN directly at any GRA office or online.";
      } else if (text.includes('vat') || text.includes('value added')) {
        reply = "Under the new 2026 VAT Act (Act 1151), the standard combined effective VAT rate is 20% (15% VAT + 2.5% GETFund + 2.5% NHIL). All service providers must register for VAT. Goods dealers must register once they hit GH¢750,000 in annual sales.";
      } else if (text.includes('paye') || text.includes('salary') || text.includes('payroll')) {
        reply = "PAYE is calculated on an employee's taxable income. First, deduct 5.5% employee SSNIT from the basic salary. Then, apply the 2026 graduated tax rates. The first GH¢490 of monthly earnings is 0% tax-free!";
      } else if (text.includes('withholding') || text.includes('wht')) {
        reply = "Withholding Tax (WHT) in Ghana requires a registered withholding agent to deduct taxes from payments. The rates for residents are 3% for goods, 5% for works, and 7.5% for services for annual cumulative payments over GH¢2,000.";
      } else if (text.includes('deadline') || text.includes('due date') || text.includes('when to file')) {
        reply = "In Ghana, PAYE returns and Withholding Tax payments are due by the 15th day of the following month. VAT/NHIL returns are due separately by the last working day of the following month.";
      } else if (text.includes('ssnit')) {
        reply = "SSNIT consists of employee (5.5%) and employer (13%) contributions, totaling 18.5% of basic salary. This is paid to the Social Security Trust and must be remitted by the 14th day of the following month.";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  const handleLogout = () => {
    localStorage.removeItem('taxflow_token');
    localStorage.removeItem('taxflow_sim_user');
    localStorage.removeItem('taxflow_sim_txs');
    setToken('');
    setUserProfile(null);
    setIsAuthenticated(false);
    setTransactions([]);
    setNotifications([]);
    setOfflineMode(false);
  };

  // Filtered transactions for the ledger list
  const filteredTransactions = transactions.filter(t => {
    if (ledgerFilter === 'all') return true;
    return t.type === ledgerFilter;
  });

  return (
    <div className="app-container">
      {/* Desktop view helper for WOW effect */}
      <div className="desktop-help">
        <h3>🇬🇭 Taxflow Ghana</h3>
        <p>A mobile-first tax companion designed for informal traders and SMEs in Ghana.</p>
        <ul>
          <li><strong>Real-time 2026 Rates:</strong> Compliant VAT, progressive PAYE, and Withholding Tax engines.</li>
          <li><strong>Offline Standalone:</strong> Automatic failover simulation if NestJS server is not started.</li>
          <li><strong>Smart Helper:</strong> Description analysis automatically guesses transaction types.</li>
        </ul>
        <div style={{fontSize: '11px', color: 'var(--accent)', marginTop: '8px'}}>
          Status: {offlineMode ? '🔴 Simulated Offline Mode' : '🟢 Connected to NestJS Server'}
        </div>
      </div>

      {/* Header section (Visible once authenticated) */}
      {isAuthenticated && (
        <header className="app-header">
          <div className="app-logo">
            Tax<span>flow</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setShowChatbot(true)}
              style={{
                background: 'var(--primary-glow)',
                border: 'none',
                color: 'var(--primary)',
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Icons.Bot />
            </button>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>
                {userProfile?.businessName}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                TIN: {userProfile?.tin}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Screens / Views Router */}
      {!isAuthenticated ? (
        // Authentication Screen
        <div className="auth-screen animate-fade">
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <div className="app-logo" style={{ fontSize: '38px', justifyContent: 'center', marginBottom: '8px' }}>
              Tax<span>flow</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Ghanaian Business Tax filing made painless</p>
          </div>

          <div className="card">
            <h3 style={{ textAlign: 'center', color: 'var(--primary)', fontWeight: '700' }}>
              {isRegistering ? 'Setup Business Profile' : 'Business Log In'}
            </h3>

            {authError && (
              <div className="alert-box danger" style={{ padding: '10px 14px', fontSize: '13px', margin: '5px 0 15px 0' }}>
                <Icons.Warning />
                <div style={{ flex: 1 }}>{authError}</div>
              </div>
            )}

            <form onSubmit={handleAuth} style={{ display: 'flex', flex: 'column', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Business Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="enter email"
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>

              {isRegistering && (
                <>
                  <div className="form-group">
                    <label>Business / Company Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Asare Enterprise" 
                      required 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tax Identification Number (TIN / Ghana Card)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. GHA-123456789-0" 
                      required 
                      value={tin}
                      onChange={(e) => setTin(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Industry Type</label>
                    <select 
                      className="form-select"
                      value={industryType}
                      onChange={(e) => setIndustryType(e.target.value)}
                    >
                      <option value="Services">Services (Consulting, rent, IT)</option>
                      <option value="Retail">Retail & Wholesale (Sales of goods)</option>
                      <option value="Manufacturing">Manufacturing (Works, production)</option>
                      <option value="Hospitality">Hospitality & Food</option>
                      <option value="Agriculture">Agriculture</option>
                    </select>
                  </div>

                  <div className="toggle-group">
                    <span>Is your business VAT registered?</span>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={vatRegistered}
                        onChange={(e) => {
                          setVatRegistered(e.target.checked);
                          if (userProfile) handleProfileUpdate(e.target.checked);
                        }} 
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary">
                {isRegistering ? 'Start Taxflow' : 'Log In to Dashboard'}
              </button>
            </form>

            <button 
              onClick={() => { setAuthError(''); setIsRegistering(!isRegistering); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginTop: '10px' }}
            >
              {isRegistering ? 'Already have an account? Log In' : "New business? Create Profile"}
            </button>
          </div>
          
          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            Developed in compliance with the Ghana Revenue Authority (GRA) Tax Act 2026.
          </div>
        </div>
      ) : (
        // Main Application Views (Tab Switcher)
        <div className="app-content animate-fade">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* Status Indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>Business Overview</h2>
                <span style={{ 
                  fontSize: '11px', 
                  backgroundColor: offlineMode ? 'var(--error-glow)' : 'var(--success-glow)', 
                  color: offlineMode ? 'var(--error)' : 'var(--success)', 
                  padding: '4px 8px', 
                  borderRadius: '12px',
                  fontWeight: '600'
                }}>
                  {offlineMode ? 'Demo Offline' : 'Live Sync'}
                </span>
              </div>

              {/* Dynamic Alerts Banner */}
              {notifications.filter(n => !n.read).map(n => (
                <div key={n.id} className={`alert-box ${n.type === 'warning' ? 'warning' : 'info'}`}>
                  <Icons.Warning />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', marginBottom: '2px' }}>{n.title}</div>
                    <div>{n.message}</div>
                  </div>
                  <button 
                    onClick={() => handleDismissNotification(n.id)}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                  >
                    <Icons.Close />
                  </button>
                </div>
              ))}

              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="card" style={{ backgroundColor: 'var(--primary-glow)', border: '1px solid var(--primary-light)' }}>
                  <div className="card-title"><span style={{color: 'var(--primary)'}}>●</span> Money In</div>
                  <div className="card-amount" style={{ color: 'var(--primary)' }}>₵{taxSummary.totalIncome}</div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gross Business Sales</span>
                </div>
                <div className="card" style={{ backgroundColor: '#fcfdfc' }}>
                  <div className="card-title"><span style={{color: 'var(--warning)'}}>●</span> Money Out</div>
                  <div className="card-amount">₵{taxSummary.totalExpense + taxSummary.totalPayroll}</div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Expenses + Payroll</span>
                </div>
              </div>

              <div className="card" style={{ border: '2px solid var(--accent)' }}>
                <div className="card-title">
                  <Icons.Tax /> Estimated Tax Owed (GRA)
                </div>
                <div className="card-amount" style={{ color: 'var(--primary)', fontSize: '36px' }}>
                  ₵{taxSummary.totalEstimatedTaxOwed}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Estimated VAT Payable:</span>
                    <strong>₵{taxSummary.vatBreakdown.vatPayable}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>PAYE Employees Tax:</span>
                    <strong>₵{taxSummary.payeBreakdown.totalPaye}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>WHT (Withheld from vendors):</span>
                    <strong>₵{taxSummary.whtBreakdown.whtWithheld}</strong>
                  </div>
                </div>
                <button onClick={() => setActiveTab('taxes')} className="btn btn-primary" style={{ padding: '10px' }}>
                  View Breakdown
                </button>
              </div>

              {/* Recent Ledger Transactions */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Recent Records</h3>
                  <button 
                    onClick={() => setActiveTab('ledger')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                  >
                    View All
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                      No financial records entered yet.<br />Tap the green float '+' button to add.
                    </div>
                  ) : (
                    transactions.slice(0, 4).map(t => (
                      <div key={t.id} className="txn-item">
                        <div className="txn-left">
                          <div className={`txn-icon ${t.type}`}>
                            {t.type === 'income' ? <Icons.Check /> : <Icons.Trash />}
                          </div>
                          <div className="txn-details">
                            <span className="txn-title">{t.description}</span>
                            <span className="txn-meta">{t.date} • {t.category}</span>
                          </div>
                        </div>
                        <div className="txn-details" style={{ alignItems: 'flex-end' }}>
                          <span className={`txn-amount ${t.type}`}>
                            {t.type === 'income' ? '+' : '-'}₵{t.amount}
                          </span>
                          {t.vatAmount > 0 && (
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>VAT: ₵{t.vatAmount}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: LEDGER (Transaction Manager) */}
          {activeTab === 'ledger' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>Business Ledger</h2>
                <button onClick={() => { resetTxForm(); setShowAddTxSheet(true); }} className="btn btn-primary" style={{ padding: '8px 12px', width: 'auto', borderRadius: '12px', fontSize: '13px' }}>
                  Record Money
                </button>
              </div>

              {/* Filter Toggles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', backgroundColor: 'rgba(0,0,0,0.03)', padding: '4px', borderRadius: '12px' }}>
                {['all', 'income', 'expense', 'payroll'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setLedgerFilter(tab)}
                    style={{
                      background: ledgerFilter === tab ? '#ffffff' : 'none',
                      border: 'none',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: ledgerFilter === tab ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      boxShadow: ledgerFilter === tab ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    {tab === 'income' ? 'In' : tab === 'expense' ? 'Out' : tab === 'payroll' ? 'Payroll' : 'All'}
                  </button>
                ))}
              </div>

              {/* Ledger Transaction List */}
              <div className="card">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredTransactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
                      No records match the filter.
                    </div>
                  ) : (
                    filteredTransactions.map(t => (
                      <div key={t.id} className="txn-item">
                        <div className="txn-left">
                          <div className={`txn-icon ${t.type}`}>
                            {t.type === 'income' ? <Icons.Check /> : <Icons.Trash />}
                          </div>
                          <div className="txn-details">
                            <span className="txn-title">{t.description}</span>
                            <span className="txn-meta">{t.date} • {t.category}</span>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                              {t.vatAmount > 0 && <span style={{ fontSize: '9px', backgroundColor: 'rgba(0,0,0,0.03)', padding: '2px 4px', borderRadius: '4px', color: 'var(--text-muted)' }}>VAT: ₵{t.vatAmount}</span>}
                              {t.payeAmount > 0 && <span style={{ fontSize: '9px', backgroundColor: 'var(--primary-glow)', padding: '2px 4px', borderRadius: '4px', color: 'var(--primary)' }}>PAYE: ₵{t.payeAmount}</span>}
                              {t.whtAmount > 0 && <span style={{ fontSize: '9px', backgroundColor: 'var(--accent-glow)', padding: '2px 4px', borderRadius: '4px', color: '#856404' }}>WHT: ₵{t.whtAmount}</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span className={`txn-amount ${t.type}`} style={{ fontSize: '15px' }}>
                            {t.type === 'income' ? '+' : '-'}₵{t.amount}
                          </span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleEditClick(t)}
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteTransaction(t.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB 3: TAX CALCULATOR TOOLS */}
          {activeTab === 'taxes' && (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>Tax Tools</h2>

              {/* 1. PAYE payslip modeler */}
              <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🇬🇭 Progressive PAYE Modeler
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>See how employees tax is split into 2026 progressive bands.</p>
                
                <div className="form-group">
                  <label>Basic Monthly Salary (GHS)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={calcBasicSalary}
                    onChange={(e) => setCalcBasicSalary(e.target.value)}
                  />
                </div>

                {calcPayeResult && (
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="calc-breakdown-row">
                      <span>Basic Salary:</span>
                      <span>₵{calcBasicSalary}</span>
                    </div>
                    <div className="calc-breakdown-row" style={{ color: 'var(--success)' }}>
                      <span>SSNIT Deduction (5.5% tax-free):</span>
                      <span>-₵{calcPayeResult.ssnit}</span>
                    </div>
                    <div className="calc-breakdown-row">
                      <span>Chargeable Taxable Income:</span>
                      <span>₵{calcPayeResult.chargeable}</span>
                    </div>
                    <div className="calc-breakdown-row" style={{ color: 'var(--error)' }}>
                      <span>Total Progressive PAYE Tax Owed:</span>
                      <span>₵{calcPayeResult.tax}</span>
                    </div>
                    <div className="calc-breakdown-row" style={{ borderTop: '2px solid var(--primary)', fontWeight: '800', fontSize: '16px' }}>
                      <span>Take-Home Net Salary:</span>
                      <span>₵{calcPayeResult.net}</span>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Progressive Brackets Used:</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                        {calcPayeResult.details.map((b, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                            <span>Band {i+1} ({b.rate}%):</span>
                            <span>Tax: ₵{Math.round(b.tax * 100) / 100} on ₵{Math.round(b.amount * 100) / 100}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. VAT Calculator */}
              <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📊 Combined VAT Calculator (Act 1151)
                </h3>
                <div className="form-group">
                  <label>Transaction Sub-Total Amount (GHS)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={calcVatAmount}
                    onChange={(e) => setCalcVatAmount(e.target.value)}
                  />
                </div>

                {calcVatResult && (
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="calc-breakdown-row">
                      <span>Sub-Total:</span>
                      <span>₵{calcVatAmount}</span>
                    </div>
                    <div className="calc-breakdown-row">
                      <span>Effective VAT Rate:</span>
                      <span>{calcVatResult.rate}</span>
                    </div>
                    <div className="calc-breakdown-row" style={{ color: 'var(--primary)', fontWeight: '700' }}>
                      <span>VAT + Levies (20% Combined):</span>
                      <span>₵{calcVatResult.vatAmount}</span>
                    </div>
                    <div className="calc-breakdown-row" style={{ fontWeight: '800' }}>
                      <span>Total Invoice Amount:</span>
                      <span>₵{calcVatResult.total}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                      *Total rate includes 15% Standard VAT + 2.5% NHIL + 2.5% GETFund. As of Jan 1, 2026, GETFund/NHIL levies are fully input-deductible.
                    </span>
                  </div>
                )}
              </div>

              {/* 3. Withholding Tax Calculator */}
              <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)' }}>
                  💸 Withholding Tax (WHT) Estimator
                </h3>
                <div className="form-group">
                  <label>Invoice Sub-Total Amount (GHS)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={calcWhtAmount}
                    onChange={(e) => setCalcWhtAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Payment Classification</label>
                  <select 
                    className="form-select"
                    value={calcWhtCategory}
                    onChange={(e) => setCalcWhtCategory(e.target.value)}
                  >
                    <option value="Goods">Supply of Goods (3%)</option>
                    <option value="Works">Supply of Works/Repairs (5%)</option>
                    <option value="Services">Supply of Services (7.5%)</option>
                  </select>
                </div>

                {calcWhtResult && (
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="calc-breakdown-row">
                      <span>Invoice Total:</span>
                      <span>₵{calcWhtAmount}</span>
                    </div>
                    <div className="calc-breakdown-row">
                      <span>Withholding Rate:</span>
                      <span>{calcWhtResult.rate}</span>
                    </div>
                    <div className="calc-breakdown-row" style={{ color: '#856404', fontWeight: '700' }}>
                      <span>Withheld Amount (To remit to GRA):</span>
                      <span>₵{calcWhtResult.whtAmount}</span>
                    </div>
                    <div className="calc-breakdown-row" style={{ fontWeight: '800' }}>
                      <span>Net Cash Paid to Supplier:</span>
                      <span>₵{calcWhtResult.netPayable}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 4: COMPLIANT REPORTS */}
          {activeTab === 'reports' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>GRA Reports</h2>
                <button onClick={() => window.print()} className="btn btn-outline" style={{ padding: '8px 12px', width: 'auto', borderRadius: '12px', fontSize: '13px' }}>
                  Print / Save PDF
                </button>
              </div>

              {/* Graphic HTML Bars representing Income vs Expenses */}
              <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Performance Overview</h3>
                <div className="chart-container">
                  <div className="chart-bar-row">
                    <div className="chart-bar-labels">
                      <span>Money In (Sales)</span>
                      <strong>₵{taxSummary.totalIncome}</strong>
                    </div>
                    <div className="chart-bar-outer">
                      <div className="chart-bar-inner income" style={{ width: `${taxSummary.totalIncome > 0 ? 100 : 0}%` }}></div>
                    </div>
                  </div>

                  <div className="chart-bar-row">
                    <div className="chart-bar-labels">
                      <span>Money Out (Expenses)</span>
                      <strong>₵{taxSummary.totalExpense + taxSummary.totalPayroll}</strong>
                    </div>
                    <div className="chart-bar-outer">
                      <div className="chart-bar-inner expense" style={{ width: `${taxSummary.totalIncome > 0 ? Math.min(100, ((taxSummary.totalExpense + taxSummary.totalPayroll) / taxSummary.totalIncome) * 100) : 0}%` }}></div>
                    </div>
                  </div>

                  <div className="chart-bar-row">
                    <div className="chart-bar-labels">
                      <span>GRA Tax Owed</span>
                      <strong>₵{taxSummary.totalEstimatedTaxOwed}</strong>
                    </div>
                    <div className="chart-bar-outer">
                      <div className="chart-bar-inner tax" style={{ width: `${taxSummary.totalIncome > 0 ? Math.min(100, (taxSummary.totalEstimatedTaxOwed / taxSummary.totalIncome) * 100) : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliant Monthly VAT Statement */}
              <div className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>
                  Monthly VAT Return Statement
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Taxable Supplies (Sales):</span>
                    <span>₵{taxSummary.totalIncome}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: '600' }}>
                    <span>Output VAT + Levies (20%):</span>
                    <span>+₵{taxSummary.vatBreakdown.outputVat}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                    <span>Total Purchase Supplies (Expenses):</span>
                    <span>₵{taxSummary.totalExpense}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: '600' }}>
                    <span>Input VAT + Levies Deductible (20%):</span>
                    <span>-₵{taxSummary.vatBreakdown.inputVat}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '15px', borderTop: '2px solid var(--primary)', paddingTop: '8px' }}>
                    <span>Final VAT Payable to GRA:</span>
                    <span>₵{taxSummary.vatBreakdown.vatPayable}</span>
                  </div>
                </div>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Note: Computed under Act 1151 where GETFund and NHIL levies are treated as claimable Input Credits.
                </span>
              </div>

              {/* General Tax Summary Statement */}
              <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>General Tax Liability Sheet</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>VAT Payable Liability:</span>
                    <span>₵{taxSummary.vatBreakdown.vatPayable}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>PAYE Submissions Owed:</span>
                    <span>₵{taxSummary.payeBreakdown.totalPaye}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Withholding Tax Owed (From supplier payments):</span>
                    <span>₵{taxSummary.whtBreakdown.whtWithheld}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                    <span>Withholding Tax Credits (Withheld from your sales):</span>
                    <span style={{ color: 'var(--success)' }}>-₵{taxSummary.whtBreakdown.whtSuffered}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '15px', borderTop: '2px solid var(--primary)', paddingTop: '8px' }}>
                    <span>Net Filing Remittance Due:</span>
                    <span style={{ color: 'var(--primary)' }}>₵{Math.max(0, Math.round((taxSummary.totalEstimatedTaxOwed - taxSummary.whtBreakdown.whtSuffered) * 100) / 100)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 5: PROFILE & BUSINESS SETTINGS */}
          {activeTab === 'profile' && (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>Business Settings</h2>

              <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Business Profile Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Business Name:</span>
                    <strong style={{ marginLeft: '8px' }}>{userProfile?.businessName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Tax Registration TIN:</span>
                    <strong style={{ marginLeft: '8px' }}>{userProfile?.tin}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Industry Category:</span>
                    <strong style={{ marginLeft: '8px' }}>{userProfile?.industryType}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Registration email:</span>
                    <strong style={{ marginLeft: '8px' }}>{userProfile?.email}</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Filing Settings</h3>
                <div className="toggle-group">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>VAT Registration Status</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Charge output VAT and claim input credits</span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={vatRegistered}
                      onChange={(e) => {
                        setVatRegistered(e.target.checked);
                        handleProfileUpdate(e.target.checked);
                      }} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
                Log Out Business Account
              </button>
            </>
          )}

        </div>
      )}

      {/* FLOAT ACTION BUTTON (For recording new transaction ledger items quickly) */}
      {isAuthenticated && (
        <button className="fab" onClick={() => { resetTxForm(); setShowAddTxSheet(true); }}>
          <Icons.Plus />
        </button>
      )}

      {/* BOTTOM NAVIGATION SHELL */}
      {isAuthenticated && (
        <nav className="bottom-nav">
          <button onClick={() => setActiveTab('dashboard')} className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <Icons.Home /> Dashboard
          </button>
          <button onClick={() => setActiveTab('ledger')} className={`nav-item ${activeTab === 'ledger' ? 'active' : ''}`}>
            <Icons.Ledger /> Ledger
          </button>
          <button onClick={() => { runLiveCalculators(); setActiveTab('taxes'); }} className={`nav-item ${activeTab === 'taxes' ? 'active' : ''}`}>
            <Icons.Tax /> Calculators
          </button>
          <button onClick={() => setActiveTab('reports')} className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}>
            <Icons.Reports /> Reports
          </button>
          <button onClick={() => setActiveTab('profile')} className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}>
            <Icons.Profile /> Profile
          </button>
        </nav>
      )}

      {/* FLOATING ACTION SHEET MODAL: ADD / EDIT TRANSACTION */}
      {showAddTxSheet && (
        <div className="bottom-sheet-overlay" onClick={() => setShowAddTxSheet(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--primary)' }}>
                {editingTxId ? 'Edit Ledger Record' : 'Record New Transaction'}
              </h3>
              <button 
                onClick={() => setShowAddTxSheet(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <Icons.Close />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Flow Type</label>
                <select 
                  className="form-select"
                  value={txType}
                  onChange={(e) => {
                    setTxType(e.target.value);
                    if (e.target.value === 'payroll') setTxCategory('Salaries');
                  }}
                >
                  <option value="income">Money In (Business Sales/Revenue)</option>
                  <option value="expense">Money Out (Business Expenses)</option>
                  <option value="payroll">Payroll (Employee Salary Payments)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description / Notes</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. consulting service or paper supplies" 
                  required
                  value={txDescription}
                  onChange={handleDescriptionChange}
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  *Smart Suggestion activates as you type notes!
                </span>
              </div>

              <div className="form-group">
                <label>Amount (GH¢)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="form-input" 
                  placeholder="0.00" 
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Filing Category</label>
                <select 
                  className="form-select"
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  disabled={txType === 'payroll'}
                >
                  <option value="Services">Services (Consulting, rent, agency)</option>
                  <option value="Goods">Goods (Office stationeries, retail items)</option>
                  <option value="Works">Works (Maintenance, repairs)</option>
                  <option value="Utilities">Utilities (ECG Electricity, water, internet)</option>
                  <option value="General Rent">Rent Expenses</option>
                  <option value="Salaries" disabled={txType !== 'payroll'}>Salaries & Wages</option>
                </select>
              </div>

              <div className="form-group">
                <label>Filing Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                Save Ledger Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING ACTION SHEET MODAL: GRA TAX ASSISTANT CHATBOT */}
      {showChatbot && (
        <div className="chatbot-overlay">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Bot />
              <div>
                <strong style={{ fontSize: '15px' }}>GRA Tax Helper</strong>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>Active • 2026 Compliant</div>
              </div>
            </div>
            <button 
              onClick={() => setShowChatbot(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <Icons.Close />
            </button>
          </div>

          <div className="chat-messages">
            {chatMessages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.sender}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="quick-replies">
            {[
              'What is a TIN?',
              'Explain 2026 VAT Act',
              'How to calculate PAYE?',
              'Ghana WHT rates?',
              'When is the deadline?'
            ].map((q, i) => (
              <button 
                key={i} 
                className="quick-tag"
                onClick={() => {
                  setChatInput(q);
                  // Simulates submission directly
                  const userMsg = { sender: 'user', text: q };
                  setChatMessages(prev => [...prev, userMsg]);
                  setTimeout(() => {
                    const text = q.toLowerCase();
                    let reply = "I'm not completely sure about that aspect, but you can find more verified tax information directly on the Ghana Revenue Authority (GRA) portal: gra.gov.gh.";
                    if (text.includes('tin')) {
                      reply = "A Taxpayer Identification Number (TIN) is a unique number issued to identify taxpayers. In Ghana, your Ghana Card PIN acts as your individual TIN, while corporate companies can register for a company TIN directly at any GRA office or online.";
                    } else if (text.includes('vat')) {
                      reply = "Under the new 2026 VAT Act (Act 1151), the standard combined effective VAT rate is 20% (15% VAT + 2.5% GETFund + 2.5% NHIL). All service providers must register for VAT. Goods dealers must register once they hit GH¢750,000 in annual sales.";
                    } else if (text.includes('paye')) {
                      reply = "PAYE is calculated on an employee's taxable income. First, deduct 5.5% employee SSNIT from the basic salary. Then, apply the 2026 graduated tax rates. The first GH¢490 of monthly earnings is 0% tax-free!";
                    } else if (text.includes('wht') || text.includes('withholding')) {
                      reply = "Withholding Tax (WHT) in Ghana requires a registered withholding agent to deduct taxes from payments. The rates for residents are 3% for goods, 5% for works, and 7.5% for services for annual cumulative payments over GH¢2,000.";
                    } else if (text.includes('deadline')) {
                      reply = "In Ghana, PAYE returns and Withholding Tax payments are due by the 15th day of the following month. VAT/NHIL returns are due separately by the last working day of the following month.";
                    }
                    setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
                  }, 600);
                  setChatInput('');
                }}
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={handleChatSubmit} className="chat-input-area">
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ask anything..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '10px 16px' }}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
