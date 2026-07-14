import React from 'react';
import { Search, Trash2, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface TransactionListProps {
  transactions: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    type: string;
    category: string;
    search: string;
    startDate: string;
    endDate: string;
  };
  flaggedTxIds?: Set<string>;
  onAddClick?: () => void;
  onFilterChange: (key: string, value: any) => void;
  onResetFilters: () => void;
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  meta,
  filters,
  flaggedTxIds,
  onAddClick,
  onFilterChange,
  onResetFilters,
  onDelete,
}) => {
  return (
    <section className="card history-section" style={{ width: '100%' }}>
      <div className="chart-header" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex-col">
          <h3>Transaction History</h3>
          <span className="subtitle" style={{ margin: 0 }}>
            Showing {transactions.length} of {meta.total} records
          </span>
        </div>
        {onAddClick && (
          <button 
            className="primary-btn animate-hover" 
            onClick={onAddClick}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            + Add Transaction
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        {/* Search */}
        <div className="form-group flex-1" style={{ minWidth: '150px' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              className="filter-input w-full"
              style={{ paddingLeft: '2rem' }}
              placeholder="Search desc or category..."
              value={filters.search}
              onChange={e => onFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Type */}
        <div className="form-group" style={{ minWidth: '100px' }}>
          <select
            className="filter-input"
            value={filters.type}
            onChange={e => onFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Category */}
        <div className="form-group" style={{ minWidth: '110px' }}>
          <select
            className="filter-input"
            value={filters.category}
            onChange={e => onFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Rent">Rent</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Transport">Transport</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Salary">Salary</option>
            <option value="Freelance">Freelance</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="form-group">
          <input
            type="date"
            className="filter-input"
            value={filters.startDate}
            onChange={e => onFilterChange('startDate', e.target.value)}
          />
        </div>

        {/* End Date */}
        <div className="form-group">
          <input
            type="date"
            className="filter-input"
            value={filters.endDate}
            onChange={e => onFilterChange('endDate', e.target.value)}
          />
        </div>

        {/* Reset Button */}
        {(filters.search || filters.type || filters.category || filters.startDate || filters.endDate) && (
          <button
            className="secondary-btn"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            onClick={onResetFilters}
          >
            Reset
          </button>
        )}
      </div>

      {/* Transactions Table */}
      <div className="table-wrapper">
        {transactions.length > 0 ? (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => {
                const dateObj = new Date(t.date);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                const isRisky = flaggedTxIds && flaggedTxIds.has(t.id);

                return (
                  <tr key={t.id}>
                    <td>
                      <div className="flex-col">
                        <span>{formattedDate}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex-col">
                        <span className="transaction-desc">{t.description}</span>
                        {t.tags.length > 0 && (
                          <div style={{ marginTop: '0.15rem' }}>
                            {t.tags.map((tag, idx) => (
                              <span key={idx} className="tag-badge">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="transaction-category">{t.category}</span>
                    </td>
                    <td>
                      <span className={`transaction-amount ${t.type}`}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      {isRisky ? (
                        <span 
                          className="tag-badge" 
                          style={{ 
                            backgroundColor: 'var(--color-pink-glow)', 
                            color: 'var(--color-pink)', 
                            border: 'none', 
                            fontSize: '0.7rem',
                            display: 'inline-block',
                            padding: '0.2rem 0.5rem',
                            fontWeight: '600'
                          }}
                        >
                          ⚠️ Review
                        </span>
                      ) : (
                        <span 
                          className="tag-badge" 
                          style={{ 
                            backgroundColor: 'var(--color-income-glow)', 
                            color: 'var(--color-income)', 
                            border: 'none', 
                            fontSize: '0.7rem',
                            display: 'inline-block',
                            padding: '0.2rem 0.5rem',
                            fontWeight: '600'
                          }}
                        >
                          🟢 Clear
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className="danger-btn"
                        title="Delete entry"
                        onClick={() => onDelete(t.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="no-data-chart" style={{ height: '200px', flexDirection: 'column' }}>
            <HelpCircle size={32} className="text-muted" style={{ marginBottom: '0.5rem' }} />
            <p>No transaction history found matches.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong>
          </span>
          <div className="pagination-actions">
            <button
              className="secondary-btn"
              style={{ padding: '0.4rem 0.6rem' }}
              disabled={meta.page <= 1}
              onClick={() => onFilterChange('page', meta.page - 1)}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              className="secondary-btn"
              style={{ padding: '0.4rem 0.6rem' }}
              disabled={meta.page >= meta.totalPages}
              onClick={() => onFilterChange('page', meta.page + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
