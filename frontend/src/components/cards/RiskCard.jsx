import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, Info } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

export default function RiskCard() {
  const { messages } = useChatStore();
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  
  let gaps = [];
  
  if (lastAssistantMessage?.response) {
    const response = lastAssistantMessage.response;
    let data = response;
    if (typeof response === 'string') {
      try { data = JSON.parse(response); } catch (e) { data = {}; }
    }
    
    if (data.researchGaps) {
      gaps = Array.isArray(data.researchGaps) ? data.researchGaps : [data.researchGaps];
    }
  }

  return (
    <Card className="rounded-2xl border border-border bg-white shadow-md overflow-hidden relative group transition-all duration-300 hover:border-red-500/30">
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-red-500 opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader className="pb-3 border-b border-border bg-red-50/50">
        <CardTitle className="text-[14px] font-black flex items-center gap-2.5 text-foreground tracking-wide uppercase">
          <div className="p-1.5 rounded-lg bg-red-100 text-red-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          Evidence Gaps & Risks
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        {gaps.length > 0 ? (
          <ul className="space-y-4 text-[14px] text-foreground font-bold list-none">
            {gaps.map((gap, idx) => (
              <li key={idx} className="leading-relaxed flex gap-3 items-start p-2 rounded-lg hover:bg-red-50 transition-colors">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                 {typeof gap === 'string' ? gap : JSON.stringify(gap)}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Info className="w-5 h-5 text-slate-600 mb-2" />
            <p className="text-[12px] text-slate-500 italic">No significant research gaps identified in current analysis.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

