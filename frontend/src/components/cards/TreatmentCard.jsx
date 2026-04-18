import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Activity, Star } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useChatStore } from '../../store/chatStore';

export default function TreatmentCard() {
  const { messages } = useChatStore();
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  
  let insights = [];
  
  if (lastAssistantMessage?.response) {
    const response = lastAssistantMessage.response;
    let data = response;
    if (typeof response === 'string') {
      try { data = JSON.parse(response); } catch (e) { data = {}; }
    }
    
    if (data.keyInsights) {
      insights = Array.isArray(data.keyInsights) ? data.keyInsights : [data.keyInsights];
    }
  }

  if (insights.length === 0) {
    return (
      <Card className="rounded-2xl border border-border bg-accent-soft shadow-md overflow-hidden relative group transition-all duration-300 hover:bg-accent-light">
        <CardHeader className="pb-3 border-b border-border bg-white/50">
          <CardTitle className="text-[14px] font-black flex items-center gap-2.5 text-foreground tracking-wide uppercase">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Activity className="w-4 h-4" />
            </div>
            Treatment Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center text-sm text-muted italic font-bold">
          No treatment insights available for this session yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-border bg-accent-soft shadow-md overflow-hidden relative group transition-all duration-300 hover:bg-accent-light">
      <CardHeader className="pb-3 border-b border-border bg-white/50">
        <CardTitle className="text-[14px] font-black flex items-center gap-2.5 text-foreground tracking-wide uppercase">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Activity className="w-4 h-4" />
          </div>
          Clinical Guidelines & Key Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 grid gap-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-border transition-colors hover:border-primary/30 shadow-sm">
            <div className="p-1.5 rounded-md bg-accent-soft text-primary shrink-0">
               <Star className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] text-foreground font-bold leading-relaxed">
                {typeof insight === 'string' ? insight : (insight.finding || insight.insight)}
              </p>
              {insight.explanation && (
                <p className="text-[11px] text-muted mt-1 font-medium italic">{insight.explanation}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

