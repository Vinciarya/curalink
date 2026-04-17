import { useChatStore } from '../../store/chatStore';
import { Zap, Search, SortDesc, Brain, CheckCircle } from 'lucide-react';
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Card } from '../ui/card';

const STAGES = [
  { key: 'connecting', label: 'Connect', icon: Zap },
  { key: 'searching', label: 'Retrieve', icon: Search },
  { key: 'ranking', label: 'Rank', icon: SortDesc },
  { key: 'synthesizing', label: 'Synthesize', icon: Brain },
  { key: 'complete', label: 'Done', icon: CheckCircle },
];

export default function StatusBar() {
  const pipelineStatus = useChatStore(s => s.pipelineStatus);

  if (pipelineStatus === 'idle' || pipelineStatus === 'error') return null;

  const activeIndex = STAGES.findIndex(s => s.key === pipelineStatus);
  const displayIndex = activeIndex === -1 ? STAGES.length - 1 : activeIndex;

  return (
    <Card className="mb-4 w-full px-8 py-4" aria-live="polite">
      <div className="flex items-center justify-between">
        {STAGES.map((stage, i) => {
          const isActive = i === displayIndex;
          const isPast = i < displayIndex || pipelineStatus === 'complete';
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex flex-1 items-center last:flex-none">
              <div className="relative flex flex-col items-center gap-2">
                <motion.div
                  className="z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300"
                  style={{
                    backgroundColor: isActive || isPast ? 'var(--bg-surface)' : 'var(--bg-base)',
                    borderColor: isPast ? 'var(--accent-primary)' : isActive ? 'var(--accent-primary)' : 'var(--bg-border)',
                    color: isActive || isPast ? 'var(--accent-primary)' : 'var(--text-muted)',
                    boxShadow: isActive ? 'var(--glow-teal)' : 'none'
                  }}
                  animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Icon size={18} />
                </motion.div>
                <span className="absolute -bottom-5 whitespace-nowrap text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  {stage.label}
                </span>
              </div>

              {i !== STAGES.length - 1 ? (
                <div className="relative mx-2 h-[2px] flex-1 bg-[var(--bg-border)]">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-[var(--accent-primary)]"
                    initial={{ width: '0%' }}
                    animate={{ width: isPast ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
