import { formatDistanceToNow } from 'date-fns';
import { useChatStore } from '../../store/chatStore';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

export default function HistorySidebar() {
  const { sessionHistory, sessionId, newSession, loadSession, isPatientFormOpen } = useChatStore();

  return (
    <aside className="hidden h-full w-[280px] flex-shrink-0 overflow-hidden border-r border-[var(--bg-border)] bg-black/10 md:flex">
      <div className="flex h-full w-full flex-col p-4">
        <div className="mb-4 flex min-h-[44px] items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl tracking-wide text-[var(--text-primary)]">Curalink</h2>
            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
              clinical research copilot
            </p>
          </div>
          <Badge variant="info">v1</Badge>
        </div>

        <Card className="mb-4 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Workspace</p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Search literature, inspect trials, and keep patient-specific context in one thread.
          </p>
          <Button
            onClick={newSession}
            variant="default"
            size="lg"
            className="mt-4 w-full justify-center"
            disabled={isPatientFormOpen}
          >
            New Research
          </Button>
        </Card>

        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Session History</div>
          <Badge variant="secondary">{sessionHistory.length}</Badge>
        </div>
        <Separator className="mb-4" />

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-3">
            {sessionHistory.length === 0 ? (
              <Card className="border-dashed p-5 text-center">
                <p className="text-sm text-[var(--text-muted)]">No history yet</p>
              </Card>
            ) : (
              sessionHistory.map(session => {
                const isActive = session.sessionId === sessionId;
                return (
                  <button
                    key={session.sessionId}
                    onClick={() => loadSession(session)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      isActive
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-dim)]/60 shadow-[var(--glow-teal)]'
                        : 'border-[var(--bg-border)] bg-white/[0.03] hover:border-[var(--accent-muted)] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-[var(--text-primary)]">
                          {session.patientName || 'Anonymous'}
                        </span>
                        <span className="mt-1 block truncate text-xs text-[var(--text-secondary)]">
                          {session.disease}
                        </span>
                      </div>
                      {isActive ? <Badge>Open</Badge> : null}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {session.createdAt ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true }) : ''}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        {session.messages?.filter(m => m.role === 'user').length || 0} queries
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
