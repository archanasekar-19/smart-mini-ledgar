import React from 'react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface HistoryPoint {
  date: string;
  balance: number;
}

interface ForecastPoint {
  date: string;
  predictedBalance: number;
}

interface CustomChartsProps {
  history: HistoryPoint[];
  forecast: ForecastPoint[];
  totalIncome: number;
  totalExpenses: number;
  expensesByCategory: Array<{ category: string; amount: number }>;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#5e50eb',      // Purple
  Transport: '#ef4444', // Red
  Utilities: '#f97316', // Orange
  Shopping: '#10b981',  // Green
  Other: '#3b82f6',     // Blue
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formattedDate = new Date(data.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return (
      <div 
        style={{ 
          backgroundColor: '#1f2937', 
          color: '#ffffff', 
          padding: '0.5rem 0.75rem', 
          borderRadius: '0.5rem', 
          fontSize: '0.78rem', 
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.15rem'
        }}
      >
        <span style={{ opacity: 0.8, fontSize: '0.7rem' }}>{formattedDate}</span>
        <span style={{ fontWeight: '700' }}>${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
    );
  }
  return null;
};

export const CustomCharts: React.FC<CustomChartsProps> = ({
  history,
  forecast,
  expensesByCategory,
}) => {
  const historyPoints = history || [];
  const forecastPoints = forecast || [];

  // Combine balance data for Area Chart
  const balanceData = [
    ...historyPoints.map((p) => ({
      date: p.date,
      balance: p.balance,
      isForecast: false,
    })),
    ...forecastPoints.map((p) => ({
      date: p.date,
      // Connect smoothly to the last history point
      balance: p.predictedBalance,
      isForecast: true,
    })),
  ];

  const hasBalanceData = balanceData.length > 0;

  // Format category expenses for Pie/Doughnut Chart
  const activeCategories = expensesByCategory.filter((c) => c.amount > 0);
  const totalExpenseSum = activeCategories.reduce((sum, c) => sum + c.amount, 0);

  const pieData = activeCategories.map((c) => {
    const color = CATEGORY_COLORS[c.category] || CATEGORY_COLORS['Other'];
    const percentage = totalExpenseSum > 0 ? (c.amount / totalExpenseSum) * 100 : 0;
    return {
      name: c.category,
      value: c.amount,
      percentage,
      color,
    };
  });

  const formatXAxisDate = (tick: string) => {
    try {
      const d = new Date(tick);
      if (isNaN(d.getTime())) return tick;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return tick;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', width: '100%' }}>
      {/* 1. Balance History (Area Chart spline) */}
      <div 
        className="card" 
        style={{ 
          padding: '1.25rem', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '1rem', 
          border: '1px solid rgba(239, 231, 245, 0.5)', 
          boxShadow: '0 4px 15px rgba(42, 12, 78, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2A0C4E', margin: 0 }}>Balance History</h3>
        </div>

        {hasBalanceData ? (
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e8ff" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxisDate}
                  stroke="#a291b5"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#a291b5"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#balanceGrad)"
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                  dot={{ r: 4, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 1.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a291b5', fontSize: '0.85rem' }}>
            No history points logged.
          </div>
        )}
      </div>

      {/* 2. Expense by Category (Doughnut Chart) */}
      <div 
        className="card" 
        style={{ 
          padding: '1.25rem', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '1rem', 
          border: '1px solid rgba(239, 231, 245, 0.5)', 
          boxShadow: '0 4px 15px rgba(42, 12, 78, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2A0C4E', margin: 0 }}>Expense by Category</h3>

        {pieData.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flex: 1, minHeight: '170px' }}>
            {/* Doughnut Chart */}
            <div style={{ width: '150px', height: '150px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              {pieData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6B5C7B' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }}></span>
                    <span>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: '700', color: '#2A0C4E' }}>{item.percentage.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a291b5', fontSize: '0.85rem' }}>
            No expense categories registered.
          </div>
        )}
      </div>
    </div>
  );
};
