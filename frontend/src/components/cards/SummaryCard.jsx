import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText } from 'lucide-react';

export default function SummaryCard() {
  return (
    <Card className="rounded-2xl border border-white/5 bg-black/20 shadow-xl backdrop-blur-md overflow-hidden relative group transition-all duration-300 hover:bg-black/30 hover:border-white/10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader className="pb-3 border-b border-white/5 bg-white/[0.02]">
        <CardTitle className="text-[15px] font-semibold flex items-center gap-2.5 text-slate-100 tracking-wide">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <FileText className="w-4 h-4" />
          </div>
          Clinical Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 text-[14px] text-slate-300 leading-relaxed font-sans font-medium">
        <p>
          This is a structured synthesis of the current status, pathogenesis, and standard 
          of care regarding the provided clinical context. It replaces the conversational 
          chatbot response with a direct, professional intelligence brief.
        </p>
      </CardContent>
    </Card>
  );
}
