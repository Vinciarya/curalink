import { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Textarea } from './textarea';
import { Badge } from './badge';
import { Check, ClipboardCheck, LayoutGrid, Search, Sparkles } from 'lucide-react';

export default function PatientForm() {
  const { setPatientContext, sessionHistory, loadSession } = useChatStore();
  const latestSession = sessionHistory && sessionHistory.length > 0 ? sessionHistory[0] : null;
  const [patientName, setPatientName] = useState('');
  const [disease, setDisease] = useState('');
  const [location, setLocation] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleResume = async () => {
    if (!latestSession) return;
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/sessions/${latestSession.sessionId}`);
      const fullData = await resp.json();
      loadSession(fullData);
    } catch (e) {
      console.error("Failed to resume session:", e);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (!disease.trim()) {
      setError('Disease / Condition is required');
      return;
    }
    if (!query.trim()) {
      setError('A question is required');
      return;
    }
    setError('');

    setPatientContext({
      patientName: patientName || 'Anonymous',
      disease,
      location
    });

    window.dispatchEvent(new CustomEvent('curalink:start-research', { detail: { query } }));
  };

  return (
    <Card className="mx-auto mt-8 w-full max-w-3xl overflow-hidden border-border bg-white shadow-xl">
      <CardHeader className="border-b border-border bg-accent-soft">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-black tracking-widest">Clinical Intake</Badge>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-border">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-black text-muted uppercase tracking-widest">Live Protocol</span>
          </div>
        </div>
        <CardTitle className="text-3xl font-black text-foreground flex items-center gap-3">
          Medical Research Assistant
          <Sparkles className="w-6 h-6 text-primary" />
        </CardTitle>
        <CardDescription className="text-[15px] text-muted font-bold max-w-xl">
          Define your clinical parameters to initiate the deep research pipeline and evidence synthesis.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-8 px-8 pb-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-muted uppercase tracking-widest ml-1">Patient Identifier</label>
              <Input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="e.g. Pt-721 or Anonymous"
                className="bg-background border-border h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all font-sans font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-muted uppercase tracking-widest ml-1">Focus Location</label>
              <Input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. USA, Canada"
                className="bg-background border-border h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all font-sans font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-primary uppercase tracking-widest ml-1 flex items-center gap-1.5">
              Condition <span className="text-red-500/50">*</span>
            </label>
            <Input
              type="text"
              value={disease}
              onChange={e => { setDisease(e.target.value); setError(''); }}
              placeholder="e.g. Stage IV Lung Adenocarcinoma"
              className="bg-background border-border h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all font-black text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-primary uppercase tracking-widest ml-1 flex items-center gap-1.5">
              Research Objective <span className="text-red-500/50">*</span>
            </label>
            <Textarea
              className="h-32 resize-none bg-background border-border p-4 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all leading-relaxed font-bold"
              value={query}
              onChange={e => { setQuery(e.target.value); setError(''); }}
              placeholder="e.g. What are the latest frontline combination therapies including Pembrolizumab?"
            />
          </div>

          {error ? <div className="text-sm text-red-400/80 bg-red-400/5 p-3 rounded-lg border border-red-400/10 italic">{error}</div> : null}

          <div className="flex justify-end items-center gap-4 pt-4">
            {latestSession && (
              <Button 
                type="button"
                variant="outline"
                onClick={handleResume}
                className="border-primary/20 text-primary hover:bg-primary/5 font-bold rounded-xl h-12 px-6 transition-all"
              >
                Resume: {latestSession.disease}
              </Button>
            )}
            <Button 
                type="submit" 
                size="lg" 
                className="bg-primary hover:bg-primary-hover text-white font-black rounded-xl h-12 px-10 transition-all transform hover:-translate-y-0.5"
            >
                Start Research Session
                <Search className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


