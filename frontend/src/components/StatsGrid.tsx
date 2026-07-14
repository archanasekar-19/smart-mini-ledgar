import React from 'react';

interface StatsGridProps {
  netBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  netBalance,
  totalIncome,
  totalExpenses,
  savingsRate,
}) => {
  return (
    <section className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', width: '100%' }}>
      {/* Net Balance */}
      <div className="card stat-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#FFFFFF', borderRadius: '1rem', border: '1px solid rgba(239, 231, 245, 0.5)', boxShadow: '0 4px 15px rgba(42, 12, 78, 0.02)' }}>
        <span style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize' }}>Net Balance</span>
        <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#2A0C4E', fontFamily: 'var(--font-display)' }}>
          ${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          ▲ 12.5% <span style={{ color: '#827295' }}>vs last month</span>
        </span>
      </div>

      {/* Total Income */}
      <div className="card stat-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#FFFFFF', borderRadius: '1rem', border: '1px solid rgba(239, 231, 245, 0.5)', boxShadow: '0 4px 15px rgba(42, 12, 78, 0.02)' }}>
        <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize' }}>Total Income</span>
        <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#2A0C4E', fontFamily: 'var(--font-display)' }}>
          ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          ▲ 18.4% <span style={{ color: '#827295' }}>vs last month</span>
        </span>
      </div>

      {/* Total Expenses */}
      <div className="card stat-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#FFFFFF', borderRadius: '1rem', border: '1px solid rgba(239, 231, 245, 0.5)', boxShadow: '0 4px 15px rgba(42, 12, 78, 0.02)' }}>
        <span style={{ color: '#db2777', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize' }}>Total Expenses</span>
        <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#2A0C4E', fontFamily: 'var(--font-display)' }}>
          ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span style={{ fontSize: '0.72rem', color: '#ef233c', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          ▼ 8.4% <span style={{ color: '#827295' }}>vs last month</span>
        </span>
      </div>

      {/* Savings Rate */}
      <div className="card stat-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#FFFFFF', borderRadius: '1rem', border: '1px solid rgba(239, 231, 245, 0.5)', boxShadow: '0 4px 15px rgba(42, 12, 78, 0.02)' }}>
        <span style={{ color: '#06b6d4', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize' }}>Savings Rate</span>
        <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#2A0C4E', fontFamily: 'var(--font-display)' }}>
          {savingsRate.toFixed(0)}%
        </span>
        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          ▲ 5% <span style={{ color: '#827295' }}>vs last month</span>
        </span>
      </div>
    </section>
  );
};
