import { useState, useRef, useEffect } from 'react';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

const STATUS_CONFIG = {
  RECRUITING: { color: '#00D48A', label: 'Recruiting' },
  ACTIVE_NOT_RECRUITING: { color: '#F0A429', label: 'Active' },
  COMPLETED: { color: '#4E6070', label: 'Completed' },
  NOT_YET_RECRUITING: { color: '#4E9EFF', label: 'Upcoming' },
  TERMINATED: { color: '#FF5B5B', label: 'Terminated' },
  WITHDRAWN: { color: '#4E6070', label: 'Withdrawn' },
};

export default function TrialCard({ trial, index, isHighlighted }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  const statusKey = trial.status?.replace(/_/g, '').toUpperCase() || '';
  const statusInfo = Object.entries(STATUS_CONFIG).find(([k]) => statusKey.includes(k.replace(/_/g, '')))?.[1] || { color: '#4E6070', label: trial.status || 'Unknown' };
  const isRecruiting = trial.status?.toUpperCase().includes('RECRUITING') && !trial.status?.toUpperCase().includes('NOT');

  return (
    <motion.div
      ref={cardRef}
      className={isHighlighted ? 'pub-card--highlighted rounded-2xl' : ''}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2">
          <Badge
            className="border-0"
            style={{ color: statusInfo.color, backgroundColor: `${statusInfo.color}20` }}
          >
            {isRecruiting ? <span className="status-pulse-dot" /> : null}
            {statusInfo.label}
          </Badge>
          <div className="flex-1"></div>
          <Badge variant="secondary">{trial.citation || trial.id}</Badge>
        </div>

        <a href={trial.url} target="_blank" rel="noopener noreferrer" className="font-serif text-[17px] leading-snug transition-all hover:underline" style={{ color: 'var(--text-primary)' }}>
          {trial.title}
        </a>

        <AnimatePresence>
          {isExpanded && trial.abstract ? (
            <motion.div
              className="mt-1 text-xs leading-relaxed"
              style={{ color: 'var(--text-primary)' }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <p className="mb-2 text-justify">{trial.abstract.length > 400 ? trial.abstract.slice(0, 400) + '...' : trial.abstract}</p>
              {trial.phase ? <p><span className="opacity-60">Phase:</span> {trial.phase}</p> : null}
              {trial.locations ? <p><span className="opacity-60">Locations:</span> {trial.locations}</p> : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mt-1 flex items-center gap-2">
          {trial.abstract ? (
            <Button onClick={() => setIsExpanded(!isExpanded)} variant="outline" size="sm">
              {isExpanded ? 'Hide Details' : 'View Details'}
            </Button>
          ) : null}
          <a href={trial.url} target="_blank" rel="noopener noreferrer" className="ml-auto">
            <Button variant="ghost" size="sm">Open</Button>
          </a>
        </div>
      </Card>
    </motion.div>
  );
}
