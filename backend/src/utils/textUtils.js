'use strict';

/**
 * TextProcessor — Object-oriented utility class for text normalization.
 * Follows the Single Responsibility Principle (SRP) by managing text data cleaning,
 * truncation, and feature extraction securely.
 */
class TextProcessor {
  /**
   * Truncate text to maxLength characters.
   * Breaks at a word boundary and appends '...' if the text was cut.
   * @param {string|null|undefined} text
   * @param {number} maxLength
   * @returns {string}
   */
  static truncate(text, maxLength = 500) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    // Cut at maxLength then remove the partial word at the cut point
    return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
  }

  /**
   * Strip HTML tags and normalize whitespace.
   * Safe to call on null / undefined.
   * @param {string|null|undefined} text
   * @returns {string}
   */
  static cleanText(text) {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '') // remove HTML tags
      .replace(/\s+/g, ' ')   // collapse whitespace
      .trim();
  }

  /**
   * Extract unique, meaningful terms (length > 3) from a free-text query.
   * Useful for building keyword sets for relevance scoring.
   * @param {string} text
   * @returns {string[]} deduplicated lowercase tokens
   */
  static extractTerms(text) {
    if (!text) return [];
    return [
      ...new Set(
        text
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 3)
      ),
    ];
  }
}

// Export the class and its static methods for backward compatibility
module.exports = {
  TextProcessor,
  truncate: TextProcessor.truncate.bind(TextProcessor),
  cleanText: TextProcessor.cleanText.bind(TextProcessor),
  extractTerms: TextProcessor.extractTerms.bind(TextProcessor)
};
