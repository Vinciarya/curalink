import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Activity } from 'lucide-react';
import { Badge } from '../ui/badge';

export default function TreatmentCard() {
  return (
    <Card className="rounded-2xl border border-white/5 bg-black/20 shadow-xl backdrop-blur-md overflow-hidden relative group transition-all duration-300 hover:bg-black/30 hover:border-white/10">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader className="pb-3 border-b border-white/5 bg-white/[0.02]">
        <CardTitle className="text-[15px] font-semibold flex items-center gap-2.5 text-slate-100 tracking-wide">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          Treatment Options & Guidelines
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 grid gap-4">
        
        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[14px] font-semibold text-slate-100">First-Line Therapy</h4>
              <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 font-medium text-[10px] tracking-wider uppercase border-0">Standard of Care</Badge>
            </div>
            <p className="text-[13px] text-slate-400 leading-relaxed pr-6">
              Standard chemoradiation protocol followed by consolidation therapy based on recent phase III trial data.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-xl bg-transparent border border-white/5 transition-colors hover:bg-white/5">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[14px] font-semibold text-slate-100">Targeted Therapy</h4>
              <Badge variant="outline" className="text-slate-400 border-slate-600/50 font-medium text-[10px] tracking-wider uppercase">Conditional</Badge>
            </div>
            <p className="text-[13px] text-slate-400 leading-relaxed pr-6">
              Tyrosine kinase inhibitors (TKIs) indicated if specific somatic mutations (e.g., EGFR, ALK) are identified.
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
