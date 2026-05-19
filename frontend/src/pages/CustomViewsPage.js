// CustomViewsPage — wires the 4 custom interactive views
import React from 'react';
import EngagementTimeline from '../components/EngagementTimeline';
import InteractionHeatmap from '../components/InteractionHeatmap';
import InteractionReportPDF from '../components/InteractionReportPDF';
import ContentRulesEditor from '../components/ContentRulesEditor';

export default function CustomViewsPage() {
  return (
    <div style={{ padding: 24, color: '#e5e7eb' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Interactive Views</h1>
      <p style={{ color: '#9ca3af', marginBottom: 18 }}>
        Custom dashboards for AI-powered interactive content: engagement timelines,
        content × action heatmaps, downloadable PDF reports, and a branching-rule editor.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <EngagementTimeline />
        <InteractionHeatmap />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        <InteractionReportPDF />
        <ContentRulesEditor />
      </div>
    </div>
  );
}
