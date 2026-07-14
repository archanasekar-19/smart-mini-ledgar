import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

interface RiskAlert {
  txId: string;
  severity: 'high' | 'medium';
  title: string;
  message: string;
  txDescription?: string;
  txAmount?: number;
}

interface FraudAuditorProps {
  alerts: RiskAlert[];
}

export const FraudAuditor: React.FC<FraudAuditorProps> = ({ alerts }) => {
  const [isOpen, setIsOpen] = useState(true);

  const highRiskCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <div className="card flex-col" style={{ gap: '1rem' }}>
      <div 
        className="chart-header" 
        style={{ marginBottom: 0, cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3>✨ Smart Budget Assistant</h3>
          <span className="tag-badge" style={{ backgroundColor: 'var(--color-income-glow)', color: 'var(--color-income)', border: 'none' }}>
            Tips
          </span>
        </div>
        <button className="secondary-btn" style={{ padding: '0.35rem' }}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <p className="subtitle" style={{ margin: 0 }}>
        Scans your transactions to help you catch double entries, unusually large purchases, and busy spending days.
      </p>

      {isOpen && (
        <div className="flex-col" style={{ gap: '1rem', marginTop: '0.5rem' }}>
          {/* Status Alert Banner */}
          {alerts.length > 0 ? (
            <div 
              style={{ 
                backgroundColor: highRiskCount > 0 ? 'var(--color-expense-glow)' : 'var(--color-pink-glow)', 
                borderColor: highRiskCount > 0 ? 'var(--color-expense)' : 'var(--color-pink)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: '0.35rem',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <ShieldAlert size={20} color={highRiskCount > 0 ? 'var(--color-expense)' : 'var(--color-pink)'} />
              <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                Take a look: We found <strong>{alerts.length}</strong> items you might want to review, like double entries or large transactions.
              </div>
            </div>
          ) : (
            <div 
              style={{ 
                backgroundColor: 'var(--color-income-glow)', 
                borderColor: 'var(--color-income)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderRadius: '0.35rem',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <ShieldCheck size={20} color="var(--color-income)" />
              <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                🟢 All clear! Your transactions look perfect. No double charges or unusual spending patterns found.
              </div>
            </div>
          )}

          {/* List of Alerts */}
          {alerts.length > 0 && (
            <div className="flex-col" style={{ gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {alerts.map((alert, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderLeft: `4px solid ${alert.severity === 'high' ? 'var(--color-expense)' : 'var(--color-pink)'}`,
                    borderRadius: '0.25rem',
                    padding: '0.6rem 0.8rem',
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{alert.title}</span>
                    <span 
                      style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: '700', 
                        textTransform: 'uppercase', 
                        color: alert.severity === 'high' ? 'var(--color-expense)' : 'var(--color-pink)',
                        backgroundColor: alert.severity === 'high' ? 'var(--color-expense-glow)' : 'var(--color-pink-glow)',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '0.15rem'
                      }}
                    >
                      Needs Review
                    </span>
                  </div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{alert.message}</span>
                  {alert.txDescription && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', display: 'flex', gap: '0.5rem' }}>
                      <span><strong>Item:</strong> {alert.txDescription}</span>
                      {alert.txAmount !== undefined && alert.txAmount > 0 && (
                        <>
                          <span>•</span>
                          <span><strong>Amount:</strong> ${alert.txAmount.toFixed(2)}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
