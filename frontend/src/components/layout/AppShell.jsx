import React from 'react';
import AppSidebar from './AppSidebar';
import ChatArea from '../chat/ChatArea';
import SourcesPanel from './SourcesPanel';
import { useChatStore } from '../../store/chatStore';

export default function AppShell() {
  const { isSourcesPanelOpen } = useChatStore();

  return (
    <div className="app-shell flex h-screen w-full overflow-hidden bg-background text-foreground font-sans antialiased">
      <AppSidebar />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <ChatArea />
      </main>

      {isSourcesPanelOpen && <SourcesPanel />}
    </div>
  );
}


