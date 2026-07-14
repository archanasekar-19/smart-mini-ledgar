import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  showToast: (text: string, type: 'success' | 'error') => void;
  toastMessage: { text: string; type: 'success' | 'error' } | null;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, showToast, toastMessage }) => {
  const [loading, setLoading] = useState(false);
  const API_BASE = 'http://localhost:3000/api';

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'archana@smartledger.com', password: 'password' })
      });

      if (res.ok) {
        const data = await res.json();
        onLoginSuccess(data.token, data.user);
      } else {
        showToast('Invalid credentials.', 'error');
      }
    } catch (err) {
      showToast('Error connecting to authentication service.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="app-container" 
      style={{ 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'radial-gradient(at 0% 0%, #e0f2fe 0px, transparent 50%), radial-gradient(at 100% 0%, #fae8ff 0px, transparent 50%), radial-gradient(at 100% 100%, #fdf2f8 0px, transparent 50%)',
        backgroundColor: '#FAF6FD',
        minHeight: '100vh',
        padding: '1.5rem',
        width: '100%'
      }}
    >
      {toastMessage && (
        <div className={`toast ${toastMessage.type === 'success' ? 'success-toast' : 'error-toast'}`} style={{ zIndex: 100 }}>
          {toastMessage.text}
        </div>
      )}

      <div 
        className="card animate-hover" 
        style={{ 
          maxWidth: '440px', 
          width: '100%', 
          padding: '2.5rem', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '1rem', 
          border: '1px solid rgba(239, 231, 245, 0.8)',
          boxShadow: '0 15px 35px rgba(130, 10, 209, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        {/* Logo & Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
          <div 
            style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'linear-gradient(to right, var(--color-violet), var(--color-pink))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(130, 10, 209, 0.2)',
              color: '#FFFFFF',
              fontSize: '1.8rem',
              fontWeight: '700'
            }}
          >
            $
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0.5rem 0 0 0', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>$martLedger</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>Personal Ledger & Budget Analytics</p>
        </div>

        {/* Continue as Archana Action Button */}
        <button 
          type="button" 
          className="primary-btn animate-hover" 
          disabled={loading}
          style={{ 
            background: 'linear-gradient(to right, var(--color-violet), var(--color-pink))',
            color: '#FFFFFF',
            padding: '0.8.5rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '600',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(130, 10, 209, 0.15)',
            marginTop: '0.5rem',
            height: '46px'
          }}
          onClick={handleQuickLogin}
        >
          {loading ? 'Signing in...' : 'Continue as Archana'}
        </button>
      </div>
    </div>
  );
};
