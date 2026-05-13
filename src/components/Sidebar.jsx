import React from "react";

export default function Sidebar({ activeTab, setActiveTab, type = 'corporate' }) {
  const tabs = [
    { id: 'baseline', label: '① Baseline Data' },
    { id: 'amend',    label: '② Select Amendments' },
    { id: 'preview',  label: '③ Preview & Export' },
  ];

  return (
    <nav style={{ borderTop: '1px solid var(--border)' }}>
      <div className="nav-links" style={{ marginTop: '20px' }}>
        {tabs.map(t => {
          const isFirst = t.id === 'baseline';
          return (
            <button
              key={t.id}
              className={activeTab === t.id ? 'active' : ''}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
      <div className="nav-footer">
        {type === 'corporate' ? (
          <>Revised Corporation Code<br />Philippines — Sec. 15 Compliant</>
        ) : (
          <>Civil Code of the Philippines<br />Title IX — Law on Partnership</>
        )}
      </div>
    </nav>
  );
}
