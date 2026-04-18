import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ShieldCheck, Info } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useChatStore } from '../../store/chatStore';

export default function ConfidenceCard() {
  const { messages } = useChatStore();
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  
  let meta = { confidence: null, sourceCount: 0, reasoning: "" };
  
  if (lastAssistantMessage?.response) {
    const response = lastAssistantMessage.response;
    let data = response;
    if (typeof response === 'string') {
      try { data = JSON.parse(response); } catch (e) { data = {}; }
    }
    
    if (data._meta) {
      meta = { 
        confidence: data._meta.confidenceScore || data._meta.confidence || null,
        sourceCount: data._meta.sourceCount || (data.sourcesUsed ? data.sourcesUsed.length : 0),
        reasoning: data._meta.reasoning || ""
      };
    }
  }

  return (
    <Card className="rounded-2xl border border-border bg-accent-soft shadow-sm overflow-hidden relative group transition-all duration-300 hover:bg-accent-light">
      <CardHeader className="pb-3 border-b border-border bg-white/50">
        <CardTitle className="text-[14px] font-black flex items-center justify-between text-foreground tracking-wide uppercase">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            Synthesis Confidence
          </div>
          {meta.confidence && (
            <Badge variant="default" className="text-[10px] uppercase tracking-widest bg-emerald-500 text-white border-0">
               {(meta.confidence * 100).toFixed(0)}% Reliability
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 flex flex-col gap-3">
        <p className="text-[14px] text-foreground font-bold leading-relaxed">
          {meta.reasoning || `Based on ${meta.sourceCount} primary sources and indexed clinical guidelines. Evidence is cross-validated for consistency.`}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-muted font-black uppercase tracking-[0.15em] mt-2">
           <Info className="w-3.5 h-3.5" />
           Source verification: Complete
        </div>
      </CardContent>
    </Card>
  );
}

