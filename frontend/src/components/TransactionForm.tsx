import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface TransactionFormProps {
  onSubmit: (data: {
    description: string;
    amount: string;
    type: 'income' | 'expense';
    category: string;
    date: string;
    tagsString: string;
  }) => void;
  onClose?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onClose }) => {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    tagsString: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    // Reset form fields
    setForm({
      description: '',
      amount: '',
      type: 'expense',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      tagsString: '',
    });
  };

  return (
    <div className="card" style={{ padding: '1.5rem', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Add Transaction</h3>
        {onClose && (
          <button 
            type="button" 
            onClick={onClose} 
            className="secondary-btn" 
            style={{ padding: '0.35rem 0.6rem', minWidth: 'auto', fontSize: '0.8rem' }}
          >
            Close
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex-col gap-1.5" style={{ gap: '1rem' }}>
        <div className="form-group">
          <label>Type</label>
          <div className="type-selector">
            <div
              className={`type-option ${form.type === 'expense' ? 'active expense' : ''}`}
              onClick={() => setForm(prev => ({ ...prev, type: 'expense' }))}
            >
              Expense
            </div>
            <div
              className={`type-option ${form.type === 'income' ? 'active income' : ''}`}
              onClick={() => setForm(prev => ({ ...prev, type: 'income' }))}
            >
              Income
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            required
            placeholder="e.g. Office rent, Groceries"
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label>Amount ($)</label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={form.category}
            onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="Food">Food</option>
            <option value="Rent">Rent</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Transport">Transport</option>
            <option value="Healthcare">Healthcare</option>
            {form.type === 'income' && (
              <>
                <option value="Salary">Salary</option>
                <option value="Freelance">Freelance</option>
              </>
            )}
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label>Tags (Comma separated)</label>
          <input
            type="text"
            placeholder="office, monthly, necessary"
            value={form.tagsString}
            onChange={e => setForm(prev => ({ ...prev, tagsString: e.target.value }))}
          />
        </div>

        <button type="submit" className="primary-btn w-full mt-2">
          <Plus size={16} /> Save Record
        </button>
      </form>
    </div>
  );
};
