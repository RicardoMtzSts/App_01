import React from 'react';

interface PanelLayoutProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}


const PanelLayout: React.FC<PanelLayoutProps> = ({ left, center, right }) => (
  <div style={{
    display: 'flex',
    height: '100vh',
    background: '#f4f6fa',
    minWidth: 0,
    minHeight: 0,
    width: '100vw',
    boxSizing: 'border-box',
    overflow: 'hidden',
    flexDirection: 'row',
  }}>
    {/* Panel Izquierdo */}
    <aside
      style={{
        width: 'min(220px, 30vw)',
        minWidth: 60,
        background: '#22335a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        boxShadow: '2px 0 8px #0001',
        zIndex: 2,
        transition: 'width 0.2s',
      }}
    >
      {left}
    </aside>
    {/* Panel Central */}
    <main
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        padding: '2vw',
        overflow: 'auto',
      }}
    >
      {center}
    </main>
    {/* Panel Derecho */}
    <aside
      style={{
        width: 'min(320px, 40vw)',
        minWidth: 80,
        background: '#f8fafd',
        borderLeft: '1px solid #e0e4ef',
        boxShadow: '-2px 0 8px #0001',
        padding: '24px 16px',
        zIndex: 2,
        transition: 'width 0.2s',
        overflowY: 'auto',
      }}
    >
      {right}
    </aside>
  </div>
);

export default PanelLayout;
