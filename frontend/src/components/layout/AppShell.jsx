import React from 'react';
import ContextSidebar from './ContextSidebar';
import AnswerWorkspace from './AnswerWorkspace';
import SourcesPanel from './SourcesPanel';

export default function AppShell() {
  return (
    <div className="dark app-shell flex h-screen w-full overflow-hidden bg-[#060b13] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,194,184,0.12),rgba(255,255,255,0))] text-foreground font-sans antialiased text-slate-200">
      <ContextSidebar />
      <AnswerWorkspace />
      <SourcesPanel />
    </div>
  );
}
