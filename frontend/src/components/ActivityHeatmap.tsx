import React from 'react';
import { ResponsiveCalendar } from '@nivo/calendar';

interface HistoryPoint {
  date: string;
  netChange: number;
}

interface ActivityHeatmapProps {
  history: HistoryPoint[];
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ history }) => {
  // Map history array into a fast-lookup dictionary
  const historyMap = new Map<string, number>();
  history.forEach(p => {
    const dateStr = new Date(p.date).toISOString().split('T')[0];
    historyMap.set(dateStr, (historyMap.get(dateStr) || 0) + p.netChange);
  });

  // Generate data points for Nivo Calendar (last 120 days ending today)
  const nivoData: Array<{ day: string; value: number }> = [];
  const today = new Date();
  const fromDate = new Date();
  fromDate.setDate(today.getDate() - 120); // 4 months ago

  for (let d = new Date(fromDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const value = historyMap.get(dateStr) || 0;
    nivoData.push({ day: dateStr, value });
  }

  const fromStr = fromDate.toISOString().split('T')[0];
  const toStr = today.toISOString().split('T')[0];

  return (
    <div className="card flex-col" style={{ gap: '1rem', minHeight: '230px' }}>
      <div className="chart-header" style={{ marginBottom: 0 }}>
        <h3>📅 Daily Savings & Cash Flow Heatmap</h3>
        <span className="tag-badge" style={{ backgroundColor: 'var(--color-pink-glow)', color: 'var(--color-pink)', border: 'none' }}>
          Nivo Calendar
        </span>
      </div>
      <p className="subtitle" style={{ margin: 0 }}>
        Diverging timeline of your daily net cash flow. Green squares represent savings surplus days; red squares represent deficit spending days.
      </p>

      {/* Nivo Calendar Container */}
      <div style={{ height: '140px', width: '100%', marginTop: '0.5rem' }}>
        <ResponsiveCalendar
          data={nivoData}
          from={fromStr}
          to={toStr}
          emptyColor="#EAF1FA"
          colors={['#FF3E1D', '#DCE6F2', '#71DD37']}
          margin={{ top: 25, right: 10, bottom: 15, left: 35 }}
          monthBorderColor="#ffffff"
          monthLegendOffset={8}
          dayBorderWidth={2}
          dayBorderColor="#ffffff"
          theme={{
            labels: {
              text: {
                fontSize: 8,
                fontFamily: 'var(--font-body)',
                fill: 'var(--color-text-secondary)',
              }
            }
          }}
          tooltip={({ day, value }) => {
            const valNum = Number(value);
            return (
              <div
                style={{
                  backgroundColor: 'var(--color-violet)',
                  color: '#ffffff',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.725rem',
                  boxShadow: '0 4px 12px rgba(16, 35, 63, 0.18)',
                  fontFamily: 'var(--font-body)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <span style={{ fontWeight: '700', marginRight: '0.5rem' }}>{day}</span>
                <span>
                  {valNum === 0
                    ? 'No Transactions'
                    : `${valNum > 0 ? 'Surplus: +' : 'Deficit: -'}$${Math.abs(valNum).toFixed(2)}`}
                </span>
              </div>
            );
          }}
        />
      </div>

      {/* Diverging Color Scale Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.725rem', color: 'var(--color-text-secondary)' }}>
        <span>High Spend Deficit</span>
        <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-expense)', borderRadius: '0.15rem' }}></span>
        <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--border-color)', borderRadius: '0.15rem' }}></span>
        <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-income)', borderRadius: '0.15rem' }}></span>
        <span>High Income Surplus</span>
      </div>
    </div>
  );
};