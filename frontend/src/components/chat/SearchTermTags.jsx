/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';

export default function SearchTermTags({ terms }) {
  if (!terms || terms.length === 0) return null;

  return (
    <div className="my-2 flex flex-wrap items-center gap-2">
      <span className="text-xs text-[var(--text-muted)]">Searching:</span>
      {terms.map((term, index) => (
        <motion.div
          key={term}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
        >
          <Badge>{term}</Badge>
        </motion.div>
      ))}
    </div>
  );
}
