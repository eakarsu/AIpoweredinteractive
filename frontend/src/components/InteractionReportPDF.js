// NON-VIZ: Interaction Report PDF downloader
import React, { useState } from 'react';

export default function InteractionReportPDF() {
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState(null);

  const download = async () => {
    setDownloading(true);
    setStatus(null);
    try {
      const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
      const res = await fetch('/api/custom-views/interaction-report', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'interaction-report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus({ ok: true, msg: `Downloaded ${blob.size} bytes` });
    } catch (e) {
      setStatus({ ok: false, msg: e.message });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ background: '#111827', padding: 16, borderRadius: 8 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#e5e7eb' }}>Interaction Report (PDF)</h3>
      <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 12 }}>
        Server-generated PDF summarizing sessions, interactions, and top content for the last 7 days.
      </p>
      <button
        onClick={download}
        disabled={downloading}
        style={{
          padding: '10px 18px',
          background: '#10b981',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: downloading ? 'not-allowed' : 'pointer',
          opacity: downloading ? 0.6 : 1,
          fontWeight: 600,
        }}
      >
        {downloading ? 'Generating…' : 'Download PDF Report'}
      </button>
      {status && (
        <div
          style={{
            marginTop: 10,
            padding: 8,
            borderRadius: 6,
            background: status.ok ? '#064e3b' : '#7f1d1d',
            color: status.ok ? '#a7f3d0' : '#fecaca',
            fontSize: 13,
          }}
        >
          {status.msg}
        </div>
      )}
    </div>
  );
}
