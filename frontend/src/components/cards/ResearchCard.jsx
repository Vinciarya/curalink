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
      <Card className="rounded-2xl border border-white/5 bg-black/20 shadow-xl backdrop-blur-md overflow-hidden relative group transition-all duration-300 hover:bg-black/30 hover:border-white/10">
        <CardHeader className="pb-3 border-b border-white/5 bg-white/[0.02]">
          <CardTitle className="text-[15px] font-semibold flex items-center gap-2.5 text-slate-100 tracking-wide">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Microscope className="w-4 h-4" />
            </div>
            Clinical Trial Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-xs text-slate-500 italic">
          No specific clinical trials identified in high-confidence literature.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-white/5 bg-black/20 shadow-xl backdrop-blur-md overflow-hidden relative group transition-all duration-300 hover:bg-black/30 hover:border-white/10">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader className="pb-3 border-b border-white/5 bg-white/[0.02]">
        <CardTitle className="text-[15px] font-semibold flex items-center gap-2.5 text-slate-100 tracking-wide">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Microscope className="w-4 h-4" />
          </div>
          Relevant Clinical Trials
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 space-y-6">
        {trials.map((trial, idx) => (
          <div key={idx} className="grid gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Beaker className="w-3.5 h-3.5 text-cyan-400" />
                 <h4 className="text-[13px] font-semibold text-slate-200">Trial Identifier</h4>
              </div>
              <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 font-medium text-[9px] tracking-widest uppercase bg-cyan-400/5">Active</Badge>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed font-sans italic">
              {typeof trial === 'string' ? trial : JSON.stringify(trial)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

