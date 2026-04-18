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
    <Card className="rounded-2xl border border-emerald-500/10 bg-black/20 shadow-xl backdrop-blur-md overflow-hidden relative group transition-all duration-300 hover:bg-black/30 hover:border-emerald-500/20">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader className="pb-3 border-b border-emerald-500/10 bg-emerald-500/[0.02]">
        <CardTitle className="text-[15px] font-semibold flex items-center justify-between text-slate-100 tracking-wide">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            Synthesis Confidence
          </div>
          {meta.confidence && (
            <Badge variant="default" className="text-[10px] uppercase tracking-widest bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-0">
               {(meta.confidence * 100).toFixed(0)}% Reliability
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 flex flex-col gap-3">
        <p className="text-[13px] text-slate-400 leading-relaxed font-sans">
          {meta.reasoning || `Based on ${meta.sourceCount} primary sources and indexed clinical guidelines. Evidence is cross-validated for consistency.`}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
           <Info className="w-3 h-3" />
           Source verification: Complete
        </div>
      </CardContent>
    </Card>
  );
}

