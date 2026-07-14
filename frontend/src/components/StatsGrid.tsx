import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

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
    <section className="stats-grid">
      {/* Net Balance */}
      <div className="card stat-card">
        <div className="stat-icon balance">
          <Wallet size={20} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Net Balance</span>
          <span
            className="stat-value"
            style={{ color: netBalance >= 0 ? 'var(--color-text-primary)' : 'var(--color-expense)' }}
          >
            ${netBalance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Total Income */}
      <div className="card stat-card">
        <div className="stat-icon income">
          <ArrowUpRight size={20} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Total Income</span>
          <span className="stat-value text-income">${totalIncome.toFixed(2)}</span>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="card stat-card">
        <div className="stat-icon expense">
          <ArrowDownLeft size={20} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value text-expense">${totalExpenses.toFixed(2)}</span>
        </div>
      </div>

      {/* Savings Rate progress indicator */}
      <div className="card stat-card flex-col" style={{ justifyContent: 'center', padding: '1rem 1.5rem' }}>
        <div className="cat-label">
          <span className="stat-label">Savings Rate</span>
          <span
            className="stat-value"
            style={{
              fontSize: '1.25rem',
              marginTop: 0,
              color: savingsRate >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
            }}
          >
            {savingsRate.toFixed(0)}%
          </span>
        </div>
        <div className="bar-track" style={{ marginTop: '0.5rem' }}>
          <div
            className="bar-fill"
            style={{
              width: `${Math.min(Math.max(savingsRate, 0), 100)}%`,
              background: savingsRate >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
            }}
          ></div>
        </div>
      </div>
    </section>
  );
};
