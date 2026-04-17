import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle } from 'lucide-react';

export default function RiskCard() {
  return (
    <Card className="rounded-2xl border border-red-500/10 bg-black/20 shadow-xl backdrop-blur-md overflow-hidden relative group transition-all duration-300 hover:bg-black/30 hover:border-red-500/20">
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-red-500/40 opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader className="pb-3 border-b border-red-500/10 bg-red-500/[0.02]">
        <CardTitle className="text-[15px] font-semibold flex items-center gap-2.5 text-slate-100 tracking-wide">
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          Risks & Limitations
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <ul className="space-y-3 text-[13px] text-slate-400 list-disc pl-5 marker:text-red-500/50">
          <li className="leading-snug">Systematic bias in early-phase reports regarding novel biologics.</li>
          <li className="leading-snug">Contraindicated for patients with severe hepatic impairment.</li>
          <li className="leading-snug">Long-term toxicity profile of combination regimens is currently undocumented.</li>
        </ul>
      </CardContent>
    </Card>
  );
}
