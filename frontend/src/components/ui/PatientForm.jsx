import { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Textarea } from './textarea';
import { Badge } from './badge';

export default function PatientForm() {
  const { setPatientContext } = useChatStore();
  const [patientName, setPatientName] = useState('');
  const [disease, setDisease] = useState('');
  const [location, setLocation] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!disease.trim()) {
      setError('Disease / Condition is required');
      return;
    }
    if (!query.trim()) {
      setError('A question is required');
      return;
    }

    setPatientContext({
      patientName: patientName || 'Anonymous',
      disease,
      location
    });

    window.dispatchEvent(new CustomEvent('curalink:start-research', { detail: { query } }));
  };

  return (
    <Card className="mx-auto mt-8 w-full max-w-3xl overflow-hidden">
      <CardHeader className="border-b border-[var(--bg-border)] bg-[linear-gradient(135deg,rgba(0,194,184,0.10),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Patient Intake</Badge>
          <Badge variant="secondary">Research Session</Badge>
        </div>
        <CardTitle>Start a focused medical research thread</CardTitle>
        <CardDescription>
          Add the core patient context once, then keep follow-up questions grounded in that same condition and location.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[var(--text-secondary)]">Patient Name <span className="opacity-50">(optional)</span></label>
              <Input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="e.g. Anonymous"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[var(--text-secondary)]">Location <span className="opacity-50">(optional)</span></label>
              <Input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Toronto, Canada"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">Disease / Condition <span className="text-red-400">*</span></label>
            <Input
              type="text"
              value={disease}
              onChange={e => { setDisease(e.target.value); setError(''); }}
              placeholder="e.g. Parkinson's disease"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">Your Question <span className="text-red-400">*</span></label>
            <Textarea
              className="h-28 resize-none"
              value={query}
              onChange={e => { setQuery(e.target.value); setError(''); }}
              placeholder="e.g. Latest treatments for deep brain stimulation"
            />
          </div>

          {error ? <div className="text-sm text-[var(--accent-warning)]">{error}</div> : null}

          <div className="flex justify-end mt-2">
            <Button type="submit" size="lg">Start Research</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
