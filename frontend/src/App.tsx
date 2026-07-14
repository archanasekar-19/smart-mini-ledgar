import { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from 'react-router-dom';
import {
  RefreshCw,
  LayoutDashboard,
  FileSpreadsheet,
  Bell,
  X,
  FileText,
  TrendingUp,
  PieChart,
  LogOut
} from 'lucide-react';
import { CustomCharts } from './components/CustomCharts';
import { StatsGrid } from './components/StatsGrid';
import { ActivityHeatmap } from './components/ActivityHeatmap';
import { FraudAuditor } from './components/FraudAuditor';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Login } from './components/Login';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  tags: string[];
  createdAt: string;
}

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  expensesByCategory: Array<{ category: string; amount: number }>;
  incomeByCategory: Array<{ category: string; amount: number }>;
  balanceHistory: Array<{ date: string; balance: number; netChange: number }>;
}

interface ForecastPoint {
  date: string;
  predictedBalance: number;
  confidence: 'low' | 'medium' | 'high';
}

interface ForecastData {
  slope: number;
  intercept: number;
  forecast: ForecastPoint[];
}

const runRiskAnalysis = (txs: Transaction[]) => {
  const alerts: Array<{ txId: string; severity: 'high' | 'medium'; title: string; message: string; txDescription?: string; txAmount?: number }> = [];

  const categoryExpenses: Record<string, number[]> = {};
  txs.forEach(t => {
    if (t.type === 'expense') {
      if (!categoryExpenses[t.category]) categoryExpenses[t.category] = [];
      categoryExpenses[t.category].push(t.amount);
    }
  });
  const categoryAverages: Record<string, number> = {};
  Object.entries(categoryExpenses).forEach(([cat, amounts]) => {
    if (amounts.length > 0) {
      categoryAverages[cat] = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    }
  });

  const dailyCounts: Record<string, number> = {};

  txs.forEach((tx, idx) => {
    const dateStr = new Date(tx.date).toISOString().split('T')[0];
    dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;

    const descLower = tx.description.toLowerCase();
    const highRiskKeywords = ['casino', 'lottery', 'crypto', 'gift card', 'giftcard', 'wire transfer', 'anonymous'];
    const foundKeyword = highRiskKeywords.find(kw => descLower.includes(kw));
    if (foundKeyword) {
      alerts.push({
        txId: tx.id,
        severity: tx.amount > 500 ? 'high' : 'medium',
        title: 'Check Description',
        message: `The text in this entry looks unusual compared to your normal description tags.`,
        txDescription: tx.description,
        txAmount: tx.amount
      });
    }

    if (tx.type === 'expense' && categoryExpenses[tx.category]?.length > 2) {
      const avg = categoryAverages[tx.category];
      if (tx.amount > avg * 3 && tx.amount > 150) {
        alerts.push({
          txId: tx.id,
          severity: tx.amount > 1000 ? 'high' : 'medium',
          title: 'Large Expense',
          message: `This expense is much higher than what you normally spend on this category.`,
          txDescription: tx.description,
          txAmount: tx.amount
        });
      }
    }

    for (let j = idx + 1; j < txs.length; j++) {
      const other = txs[j];
      const sameDate = new Date(tx.date).toDateString() === new Date(other.date).toDateString();
      if (
        tx.amount === other.amount &&
        tx.type === other.type &&
        tx.category === other.category &&
        tx.description.toLowerCase().trim() === other.description.toLowerCase().trim() &&
        sameDate
      ) {
        const exists = alerts.some(a => a.txId === tx.id || a.txId === other.id);
        if (!exists) {
          alerts.push({
            txId: tx.id,
            severity: 'medium',
            title: 'Possible Double Charge',
            message: `We found two identical entries on this date. Did you log this twice by mistake?`,
            txDescription: tx.description,
            txAmount: tx.amount
          });
        }
      }
    }
  });

  txs.forEach(tx => {
    const dateStr = new Date(tx.date).toISOString().split('T')[0];
    if (dailyCounts[dateStr] > 4) {
      alerts.push({
        txId: tx.id,
        severity: 'high',
        title: 'Busy Spending Day',
        message: `An unusually high number of transaction entries were logged on this date. Make sure you haven't added duplicate items.`,
        txDescription: tx.description,
        txAmount: tx.amount
      });
    }
  });

  return alerts;
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication states
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(JSON.parse(localStorage.getItem('user') || 'null'));

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [summary, setSummary] = useState<SummaryData>({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    expensesByCategory: [],
    incomeByCategory: [],
    balanceHistory: [],
  });
  const [forecast, setForecast] = useState<ForecastData>({ slope: 0, intercept: 0, forecast: [] });

  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });

  const [isTwilioDialogOpen, setIsTwilioDialogOpen] = useState(false);
  const [smsRecipient, setSmsRecipient] = useState('+919384257033');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const API_BASE = 'http://localhost:3000/api';

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    showToast(`Welcome back, ${newUser.name}!`, 'success');
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    showToast('Signed out successfully.', 'success');
    navigate('/login');
  };

  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setToastMessage(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());

      const res = await fetch(`${API_BASE}/transactions?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
        setMeta(data.meta);
      } else if (res.status === 401) {
        handleLogout();
      } else {
        showToast('Failed to load transaction data.', 'error');
      }
    } catch (err) {
      showToast('Failed to connect to the backend server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, token, API_BASE]);

  const fetchSummary = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/transactions/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  }, [token, API_BASE]);

  const fetchForecast = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/transactions/forecast`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setForecast(data);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Error fetching forecast:', err);
    }
  }, [token, API_BASE]);

  useEffect(() => {
    if (token) {
      fetchTransactions();
    }
  }, [fetchTransactions, token]);

  useEffect(() => {
    if (token) {
      fetchSummary();
      fetchForecast();
    }
  }, [fetchSummary, fetchForecast, token]);

  useEffect(() => {
    setSmsMessage(`Ledger Update: Net balance is $${summary.netBalance.toFixed(2)}. Income is $${summary.totalIncome.toFixed(2)}, Expenses: $${summary.totalExpenses.toFixed(2)}.`);
  }, [summary]);

  const handleManualSubmit = async (data: {
    description: string;
    amount: string;
    type: 'income' | 'expense';
    category: string;
    date: string;
    tagsString: string;
  }) => {
    if (!token) return;
    const amountNum = parseFloat(data.amount);
    const tags = data.tagsString
      ? data.tagsString.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];

    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: data.description,
          amount: amountNum,
          type: data.type,
          category: data.category,
          date: data.date,
          tags
        })
      });

      if (res.ok) {
        setUnreadCount(prev => prev + 1);
        fetchTransactions();
        fetchSummary();
        fetchForecast();
        showToast('Transaction recorded successfully. SMS alert scheduled.', 'success');
      } else {
        showToast('Failed to add transaction.', 'error');
      }
    } catch (err) {
      showToast('Network error while adding transaction.', 'error');
    }
  };

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!smsRecipient || !smsMessage) {
      showToast('Please specify recipient and message.', 'error');
      return;
    }

    setSmsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/transactions/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          medium: 'sms',
          recipient: smsRecipient,
          message: smsMessage
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, 'success');
      } else {
        showToast(data.message || 'Failed to dispatch Twilio SMS.', 'error');
      }
    } catch (err) {
      showToast('Error connecting to Twilio dispatcher service.', 'error');
    } finally {
      setSmsLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUnreadCount(prev => prev + 1);
        fetchTransactions();
        fetchSummary();
        fetchForecast();
        showToast('Transaction deleted. SMS alert scheduled.', 'success');
      } else {
        showToast('Failed to delete transaction.', 'error');
      }
    } catch (err) {
      showToast('Network error deleting transaction.', 'error');
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleResetFilters = () => {
    setFilters({ type: '', category: '', search: '', startDate: '', endDate: '', page: 1, limit: 10 });
  };

  const handleRefreshAll = () => {
    fetchTransactions();
    fetchSummary();
    fetchForecast();
  };

  const openTwilioDialog = () => {
    setIsTwilioDialogOpen(true);
    setUnreadCount(0);
  };

  const applyBalanceTemplate = () => {
    const savingsRate = summary.totalIncome > 0
      ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100
      : 0;

    const txt = `$martLedger Report:\nNet Balance: $${summary.netBalance.toFixed(2)}\nIncome: $${summary.totalIncome.toFixed(2)}\nExpenses: $${summary.totalExpenses.toFixed(2)}\nSavings Rate: ${savingsRate.toFixed(0)}%`;
    setSmsMessage(txt);
    showToast('Loaded balance summary template.', 'success');
  };

  const applyCategoryTemplate = () => {
    const sortedCats = [...summary.expensesByCategory].sort((a, b) => b.amount - a.amount);
    const txt = sortedCats.length > 0
      ? `$martLedger Alert:\nYour top expense category is ${sortedCats[0].category} ($${sortedCats[0].amount.toFixed(2)}).\nTotal Expenses: $${summary.totalExpenses.toFixed(2)}`
      : `$martLedger Alert:\nNo expense entries recorded yet. Total: $0.00`;
    setSmsMessage(txt);
    showToast('Loaded top category template.', 'success');
  };

  const applyForecastTemplate = () => {
    const lastForecast = forecast.forecast && forecast.forecast.length > 0
      ? forecast.forecast[forecast.forecast.length - 1]
      : null;

    const txt = lastForecast
      ? `$martLedger Forecast:\nProjected balance on ${new Date(lastForecast.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} is $${lastForecast.predictedBalance.toFixed(2)}.\nSpending Velocity: ${forecast.slope >= 0 ? '+' : ''}$${forecast.slope.toFixed(2)}/day.`
      : `$martLedger Forecast:\nNo history available to compute linear projections.`;
    setSmsMessage(txt);
    showToast('Loaded 7-day projection template.', 'success');
  };

  const savingsRate = summary.totalIncome > 0
    ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100
    : 0;

  const riskAlerts = runRiskAnalysis(transactions);
  const flaggedTxIds = new Set(riskAlerts.map(a => a.txId));

  // Determine current active navigation state based on path
  const isDashboardRoute = location.pathname === '/dashboard' || location.pathname === '/';
  const isTransactionsRoute = location.pathname === '/transactions' || location.pathname === '/transaction';

  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={
          token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login
              onLoginSuccess={handleLoginSuccess}
              showToast={showToast}
              toastMessage={toastMessage}
            />
          )
        }
      />

      {/* Main Authenticated Layout Routes */}
      <Route
        path="/*"
        element={
          !token ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="app-container">
              {/* 1. Full-Width Topbar Sticky Header */}
              <header className="topbar">
                <div className="topbar-title">
                  <h2>SmartLedger</h2>
                </div>

                <div className="topbar-actions" style={{ gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500', marginRight: '0.5rem', opacity: 0.9 }}>
                    Hi, {user?.name || 'User'}
                  </span>

                  <button className="topbar-btn" onClick={handleRefreshAll}>
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Sync
                  </button>

                  {/* Notification Bell Button */}
                  <div className="notification-bell-btn">
                    <button className="topbar-btn" onClick={openTwilioDialog} style={{ padding: '0.5rem 0.75rem' }}>
                      <Bell size={16} />
                      {unreadCount > 0 && <span className="bell-badge" style={{ top: '-6px', right: '-6px' }}>{unreadCount}</span>}
                    </button>
                  </div>

                  <button className="topbar-btn" onClick={() => setIsAddTransactionOpen(true)}>
                    + Add Transaction
                  </button>

                  <button className="topbar-btn" onClick={handleLogout} style={{ backgroundColor: 'rgba(239, 35, 60, 0.2)', borderColor: 'rgba(239, 35, 60, 0.35)', color: '#FFFFFF' }}>
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </header>

              <div className="app-layout">
                {/* 2. Left Sidebar Navigation */}
                <aside className="sidebar">
                  <nav className="sidebar-nav">
                    <div
                      className={`nav-link ${isDashboardRoute ? 'active' : ''}`}
                      onClick={() => navigate('/dashboard')}
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </div>
                    <div
                      className={`nav-link ${isTransactionsRoute ? 'active' : ''}`}
                      onClick={() => navigate('/transactions')}
                    >
                      <FileSpreadsheet size={16} />
                      Transactions
                    </div>
                  </nav>

                  <div className="sidebar-footer">
                    <span>Version 1.0.0</span>
                  </div>
                </aside>

                {/* Right Content Wrapper */}
                <div className="content-wrapper">
                  {/* Main Content Scroll View */}
                  <main className="main-content">
                    {toastMessage && (
                      <div className={`toast ${toastMessage.type === 'success' ? 'success-toast' : 'error-toast'}`}>
                        {toastMessage.text}
                      </div>
                    )}

                    <Routes>
                      {/* Dashboard Content */}
                      <Route
                        path="/dashboard"
                        element={
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <StatsGrid
                              netBalance={summary.netBalance}
                              totalIncome={summary.totalIncome}
                              totalExpenses={summary.totalExpenses}
                              savingsRate={savingsRate}
                            />
                            <CustomCharts
                              history={summary.balanceHistory}
                              forecast={forecast.forecast}
                              totalIncome={summary.totalIncome}
                              totalExpenses={summary.totalExpenses}
                              expensesByCategory={summary.expensesByCategory}
                            />
                            <ActivityHeatmap history={summary.balanceHistory} />
                            <FraudAuditor alerts={riskAlerts} />
                          </div>
                        }
                      />

                      {/* Transactions Content */}
                      <Route
                        path="/transactions"
                        element={
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
                            <TransactionList
                              transactions={transactions}
                              meta={meta}
                              filters={filters}
                              flaggedTxIds={flaggedTxIds}
                              onAddClick={undefined}
                              onFilterChange={handleFilterChange}
                              onResetFilters={handleResetFilters}
                              onDelete={handleDeleteTransaction}
                            />
                          </div>
                        }
                      />

                      {/* Alias /transaction route */}
                      <Route
                        path="/transaction"
                        element={
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
                            <TransactionList
                              transactions={transactions}
                              meta={meta}
                              filters={filters}
                              flaggedTxIds={flaggedTxIds}
                              onAddClick={undefined}
                              onFilterChange={handleFilterChange}
                              onResetFilters={handleResetFilters}
                              onDelete={handleDeleteTransaction}
                            />
                          </div>
                        }
                      />

                      {/* Default dashboard redirect */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>

              {/* 4. Add Transaction Dialog Overlay modal */}
              {isAddTransactionOpen && (
                <div className="modal-overlay">
                  <div className="modal-container" style={{ maxWidth: '480px' }}>
                    <TransactionForm
                      onSubmit={(data) => {
                        handleManualSubmit(data);
                        setIsAddTransactionOpen(false);
                      }}
                      onClose={() => setIsAddTransactionOpen(false)}
                    />
                  </div>
                </div>
              )}

              {/* 5. Twilio Settings & SMS Dispatcher Modal Dialog */}
              {isTwilioDialogOpen && (
                <div className="modal-overlay">
                  <div className="modal-container">
                    <div className="modal-header">
                      <h3>SMS Notification</h3>
                      <button className="modal-close-btn" onClick={() => setIsTwilioDialogOpen(false)}>
                        <X size={16} />
                      </button>
                    </div>

                    <div className="modal-body">
                      <form onSubmit={handleSendSms} className="flex-col" style={{ gap: '0.85rem' }}>
                        <div className="form-group">
                          <label>Recipient Phone Number</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +919384257033"
                            value={smsRecipient}
                            onChange={(e) => setSmsRecipient(e.target.value)}
                          />
                          <span className="help-text" style={{ fontSize: '0.725rem', marginTop: '0.25rem', lineHeight: '1.25' }}>
                            💡 Tip: Feel free to type in your own mobile number here (in international format, e.g. <code>+919384257033</code>) to receive live SMS updates!
                          </span>
                        </div>

                        <div className="form-group">
                          <label>Quick Report Templates</label>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                            <button
                              type="button"
                              className="secondary-btn"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.35rem' }}
                              onClick={applyBalanceTemplate}
                            >
                              <FileText size={12} /> Balance Stats
                            </button>
                            <button
                              type="button"
                              className="secondary-btn"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.35rem' }}
                              onClick={applyCategoryTemplate}
                            >
                              <PieChart size={12} /> Top Expense
                            </button>
                            <button
                              type="button"
                              className="secondary-btn"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.35rem' }}
                              onClick={applyForecastTemplate}
                            >
                              <TrendingUp size={12} /> 7-Day Forecast
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Alert Message Content</label>
                          <textarea
                            rows={3}
                            required
                            style={{
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '0.25rem',
                              padding: '0.6rem',
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.875rem',
                              resize: 'vertical',
                              color: 'var(--color-text-primary)'
                            }}
                            value={smsMessage}
                            onChange={(e) => setSmsMessage(e.target.value)}
                          ></textarea>
                        </div>

                        <button type="submit" className="primary-btn w-full" disabled={smsLoading} style={{ marginTop: '0.25rem' }}>
                          {smsLoading ? 'Sending...' : 'Send SMS Alert'}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
