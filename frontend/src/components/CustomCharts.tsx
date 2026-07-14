import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
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

export const CustomCharts: React.FC<CustomChartsProps> = ({
  history,
  forecast,
  totalIncome,
  totalExpenses,
  expensesByCategory,
}) => {
  const historyPoints = history || [];
  const forecastPoints = forecast || [];

  // Combine data for area chart
  // We want to render a single continuous timeline where:
  // - History points have History balance, Forecast = null
  // - Forecast points have Forecast balance, History = null
  // To connect the line smoothly: the first forecast point's History balance matches the last history balance
  const balanceData = [
    ...historyPoints.map((p) => ({
      date: p.date,
      History: p.balance,
      Forecast: null,
    })),
    ...forecastPoints.map((p, idx) => ({
      date: p.date,
      // Connect the forecast line smoothly to the end of the history line
      History: idx === 0 && historyPoints.length > 0 ? historyPoints[historyPoints.length - 1].balance : null,
      Forecast: p.predictedBalance,
    })),
  ];

  const hasBalanceData = balanceData.length > 0;

  // Comparison data for Income vs Expense
  const comparisonData = [
    { name: 'Income', amount: totalIncome, fill: 'var(--color-income)' },
    { name: 'Expense', amount: totalExpenses, fill: 'var(--color-expense)' },
  ];

  // Active Category Expenses
  const activeCategories = expensesByCategory.filter(c => c.amount > 0);
  const categoryData = activeCategories.map(c => ({
    name: c.category,
    amount: c.amount,
  }));

  // Custom tooltips formatter helper
  const formatTooltipAmount = (value: any) => [`$${parseFloat(value).toFixed(2)}`, ''];
  
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
    <div className="analytics-grid" style={{ gap: '2rem' }}>
      {/* 1. Area Chart: Balance History Bezier Curve & Forecast */}
      <div className="card chart-card" style={{ gridColumn: 'span 2', position: 'relative' }}>
        <div className="chart-header">
          <h3>Balance History & 7-Day Forecast</h3>
          <div className="legend">
            <span className="legend-item"><span className="bullet history"></span>History</span>
            <span className="legend-item"><span className="bullet forecast"></span>7-Day Forecast</span>
          </div>
        </div>
        
        {hasBalanceData ? (
          <div style={{ width: '100%', height: '220px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="historyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-violet)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--color-violet)" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-pink)" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="var(--color-pink)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxisDate}
                  stroke="var(--color-text-secondary)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-text-secondary)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={formatTooltipAmount}
                  labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  contentStyle={{
                    backgroundColor: 'var(--color-violet)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-body)',
                  }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem' }}
                />
                <Area
                  type="monotone"
                  dataKey="History"
                  stroke="var(--color-violet)"
                  strokeWidth={2.5}
                  fill="url(#historyGrad)"
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="Forecast"
                  stroke="var(--color-pink)"
                  strokeDasharray="5 5"
                  strokeWidth={2.5}
                  fill="url(#forecastGrad)"
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="no-data-chart" style={{ height: '220px' }}>
            <p>Add transactions to populate the timeline projection.</p>
          </div>
        )}
      </div>

      {/* 2. Income vs Expense Bar Chart */}
      <div className="card chart-card flex-col" style={{ minHeight: '270px' }}>
        <h3>Income vs Expense</h3>
        
        {totalIncome + totalExpenses > 0 ? (
          <div style={{ width: '100%', height: '180px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-text-secondary)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-text-secondary)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={formatTooltipAmount}
                  contentStyle={{
                    backgroundColor: 'var(--color-violet)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-body)',
                  }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ display: 'none' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="no-data-chart" style={{ height: '180px' }}>
            <p>No income/expense records registered.</p>
          </div>
        )}
      </div>

      {/* 3. Category Expense Bar Chart */}
      <div className="card chart-card flex-col" style={{ minHeight: '270px' }}>
        <h3>Expense by Category</h3>
        
        {activeCategories.length > 0 ? (
          <div style={{ width: '100%', height: '180px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-text-secondary)"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-text-secondary)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={formatTooltipAmount}
                  contentStyle={{
                    backgroundColor: 'var(--color-violet)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-body)',
                  }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ display: 'none' }}
                />
                <Bar dataKey="amount" fill="var(--color-pink)" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="no-data-chart" style={{ height: '180px' }}>
            <p>No category expenses recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
};
