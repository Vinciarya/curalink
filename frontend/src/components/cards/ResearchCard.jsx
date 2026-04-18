import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Microscope, Beaker } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useChatStore } from '../../store/chatStore';

export default function ResearchCard() {
  const { messages } = useChatStore();
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  
  let trials = [];
  
  if (lastAssistantMessage?.response) {
    const response = lastAssistantMessage.response;
    let data = response;
    if (typeof response === 'string') {
      try { data = JSON.parse(response); } catch (e) { data = {}; }
    }
    
    if (data.clinicalTrials) {
      trials = Array.isArray(data.clinicalTrials) ? data.clinicalTrials : [data.clinicalTrials];
    }
  }

  if (trials.length === 0) {
    return (
      <Card className="rounded-2xl border border-border bg-accent-soft shadow-sm overflow-hidden relative group transition-all duration-300 hover:bg-accent-light">
        <CardHeader className="pb-3 border-b border-border bg-white/50">
          <CardTitle className="text-[14px] font-black flex items-center gap-2.5 text-foreground tracking-wide uppercase">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Microscope className="w-4 h-4" />
            </div>
            Clinical Trial Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-xs text-muted italic font-bold">
          No specific clinical trials identified in high-confidence literature.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-border bg-accent-soft shadow-sm overflow-hidden relative group transition-all duration-300 hover:bg-accent-light">
      <CardHeader className="pb-3 border-b border-border bg-white/50">
        <CardTitle className="text-[14px] font-black flex items-center gap-2.5 text-foreground tracking-wide uppercase">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Microscope className="w-4 h-4" />
          </div>
          Relevant Clinical Trials
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        {trials.map((trial, idx) => (
          <div key={idx} className="grid gap-3 p-4 rounded-xl bg-white border border-border shadow-sm transition-all hover:border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Beaker className="w-3.5 h-3.5 text-primary" />
                 <h4 className="text-[12px] font-black uppercase tracking-tight text-primary">Trial Identifier</h4>
              </div>
              <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-accent-soft border-border text-muted">Active</Badge>
            </div>
            <div className="flex flex-col gap-1.5 pt-1">
              <h5 className="text-[13px] font-black text-foreground leading-snug">
                {trial.title || "Untitled Study"}
              </h5>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans italic">
                {trial.relevance || trial.citation || ""}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

