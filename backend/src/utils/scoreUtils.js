'use strict';

/**
 * ScoreMath — Object-oriented utility class for scoring mathematics.
 * Follows the Single Responsibility Principle (SRP) by encapsulating 
 * algorithms related purely to string proximity and numeric constraints.
 */
class ScoreMath {
  /**
   * Levenshtein edit distance between two strings.
   * Classic DP approach — O(m × n) time, O(m × n) space.
   * @param {string} a
   * @param {string} b
   * @returns {number}
   */
  static editDistance(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Similarity ratio between two strings (0 = completely different, 1 = identical).
   * Based on edit distance relative to the longer string's length.
   * @param {string} a
   * @param {string} b
   * @returns {number} value in [0, 1]
   */
  static similarity(a, b) {
    const longer  = a.length >= b.length ? a : b;
    const shorter = a.length >= b.length ? b : a;
    if (longer.length === 0) return 1.0;
    return (longer.length - this.editDistance(longer, shorter)) / longer.length;
  }

  /**
   * Lowercase + strip punctuation for fair title comparisons.
   * @param {string} title
   * @returns {string}
   */
  static normalizeTitle(title) {
    return title.toLowerCase().replace(/[^\w\s]/g, '').trim();
  }

  /**
   * Clamp a numeric value between min and max (inclusive).
   * @param {number} val
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  static clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }
}

// Export the class and its static methods for backward compatibility
module.exports = {
  ScoreMath,
  editDistance: ScoreMath.editDistance.bind(ScoreMath),
  similarity: ScoreMath.similarity.bind(ScoreMath),
  normalizeTitle: ScoreMath.normalizeTitle.bind(ScoreMath),
  clamp: ScoreMath.clamp.bind(ScoreMath)
};
