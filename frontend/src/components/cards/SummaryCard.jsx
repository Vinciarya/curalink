import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText, Sparkles } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

export default function SummaryCard() {
  const { messages } = useChatStore();
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  
  let content = "Research synthesis will appear here once the analysis is complete.";
  
  if (lastAssistantMessage?.response) {
    const response = lastAssistantMessage.response;
    if (typeof response === 'object') {
      content = response.conditionOverview || response.summary || "Summary data format not recognized.";
    } else {
      content = response; // Fallback if it's just a raw message
    }
  }

  return (
    <Card className="rounded-2xl border border-border bg-accent-soft shadow-md overflow-hidden relative group transition-all duration-300 hover:bg-accent-light">
      <CardHeader className="pb-3 border-b border-border bg-white/50">
        <CardTitle className="text-[14px] font-black flex items-center gap-2.5 text-foreground tracking-wide uppercase">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <FileText className="w-4 h-4" />
          </div>
          Clinical Intelligence Brief
          {lastAssistantMessage && <Sparkles className="w-3 h-3 text-primary ml-auto animate-pulse" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 text-[15px] text-foreground leading-relaxed font-bold">
        <div className="whitespace-pre-wrap">
          {typeof content === 'string' ? content : "Invalid summary content format"}
        </div>
      </CardContent>
    </Card>
  );
}



