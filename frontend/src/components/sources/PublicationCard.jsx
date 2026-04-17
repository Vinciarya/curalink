import { useState, useRef, useEffect } from 'react';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
import SourceBadge from './SourceBadge';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

export default function PublicationCard({ publication, index, isHighlighted }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

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
          <SourceBadge source={publication.source} />
          <Badge variant="secondary">{publication.year || 'Unknown year'}</Badge>
          <div className="flex-1"></div>
          {publication.score ? <Badge variant="info">{publication.score?.toFixed(0)} pts</Badge> : null}
        </div>

        <a href={publication.url} target="_blank" rel="noopener noreferrer" className="font-serif text-[17px] leading-snug transition-all hover:underline" style={{ color: 'var(--text-primary)' }}>
          {publication.title}
        </a>

        {publication.authors && publication.authors.length > 0 ? (
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            {publication.authors.slice(0, 3).join(', ')}
            {publication.authors.length > 3 ? ' et al.' : ''}
          </p>
        ) : null}

        <AnimatePresence>
          {isExpanded && publication.abstract ? (
            <motion.p
              className="mt-1 text-xs leading-relaxed text-justify"
              style={{ color: 'var(--text-primary)' }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {publication.abstract.length > 500 ? publication.abstract.slice(0, 500) + '...' : publication.abstract}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <div className="mt-1 flex items-center gap-2">
          {publication.abstract ? (
            <Button onClick={() => setIsExpanded(!isExpanded)} variant="outline" size="sm">
              {isExpanded ? 'Hide Abstract' : 'Read Abstract'}
            </Button>
          ) : null}
          <a href={publication.url} target="_blank" rel="noopener noreferrer" className="ml-auto">
            <Button variant="ghost" size="sm">Open</Button>
          </a>
        </div>
      </Card>
    </motion.div>
  );
}
