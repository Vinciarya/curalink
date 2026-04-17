import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Microscope } from 'lucide-react';
import { Badge } from '../ui/badge';

export default function ResearchCard() {
  return (
    <Card className="rounded-2xl border border-white/5 bg-black/20 shadow-xl backdrop-blur-md overflow-hidden relative group transition-all duration-300 hover:bg-black/30 hover:border-white/10">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader className="pb-3 border-b border-white/5 bg-white/[0.02]">
        <CardTitle className="text-[15px] font-semibold flex items-center gap-2.5 text-slate-100 tracking-wide">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Microscope className="w-4 h-4" />
          </div>
          Emerging Research & Trials
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[14px] font-semibold text-slate-200">Active Clinical Trials</h4>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 font-medium text-[10px] tracking-widest uppercase bg-cyan-400/5">Phase III</Badge>
          </div>
          <p className="text-[13px] text-slate-400 leading-relaxed font-sans">
            Several novel immunotherapeutics are demonstrating prolonged progression-free survival 
            in recent double-blind RCTs (NCT04561234, NCT05678901), though overall survival data 
            remains immature.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
