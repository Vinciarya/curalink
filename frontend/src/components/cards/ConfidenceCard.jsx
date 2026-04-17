import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/badge';

export default function ConfidenceCard() {
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
          <Badge variant="default" className="text-[10px] uppercase tracking-widest bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-0">High Reliability (88%)</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 flex gap-4 items-start">
        <p className="flex-1 text-[13px] text-slate-400 leading-relaxed font-sans">
          Based on 24 peer-reviewed sources and 3 standard clinical guidelines. 
          Evidence is highly concordant with minimal contradiction across selected journals.
        </p>
      </CardContent>
    </Card>
  );
}
