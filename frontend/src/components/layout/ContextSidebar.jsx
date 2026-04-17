import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Search, UserRound } from 'lucide-react';

export default function ContextSidebar() {
  return (
    <div className="w-[300px] shrink-0 border-r border-white/5 bg-black/40 backdrop-blur-xl h-full flex flex-col p-6 overflow-y-auto z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]">
      <div className="mb-8 px-1">
        <h2 className="text-[17px] font-semibold tracking-wide text-slate-100 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <UserRound className="w-4 h-4" />
          </div>
          Patient Context
        </h2>
        <p className="text-[13px] text-slate-400 mt-2 leading-relaxed">
          Define the clinical parameters for the research query.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2.5">
          <Label htmlFor="disease" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Disease / Condition *
          </Label>
          <Input 
            id="disease" 
            placeholder="e.g., Non-Small Cell Lung Cancer" 
            className="rounded-xl bg-black/20 border-white/5 h-11 text-[13px] text-slate-200 placeholder:text-slate-600 focus-visible:ring-teal-500/50 focus-visible:border-teal-500/30 transition-all"
          />
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="intent" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Clinical Intent
          </Label>
          <Input 
            id="intent" 
            placeholder="e.g., Treatment options, diagnosis" 
            className="rounded-xl bg-black/20 border-white/5 h-11 text-[13px] text-slate-200 placeholder:text-slate-600 focus-visible:ring-teal-500/50 focus-visible:border-teal-500/30 transition-all"
          />
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="location" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Location / Demographics
          </Label>
          <Input 
            id="location" 
            placeholder="e.g., USA, 65yo Male" 
            className="rounded-xl bg-black/20 border-white/5 h-11 text-[13px] text-slate-200 placeholder:text-slate-600 focus-visible:ring-teal-500/50 focus-visible:border-teal-500/30 transition-all"
          />
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="notes" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Additional Notes
          </Label>
          <Textarea 
            id="notes" 
            placeholder="Comorbidities, current medications..." 
            className="rounded-xl resize-none h-28 bg-black/20 border-white/5 text-[13px] text-slate-200 placeholder:text-slate-600 focus-visible:ring-teal-500/50 focus-visible:border-teal-500/30 py-3 transition-all"
          />
        </div>

        <Button className="w-full rounded-xl mt-6 h-11 bg-teal-500 hover:bg-teal-400 text-teal-950 shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] hover:-translate-y-0.5 border-0">
          <Search className="w-4 h-4 mr-2 opacity-80" />
          <span className="font-semibold tracking-wide">Analyze Context</span>
        </Button>
      </div>
    </div>
  );
}
