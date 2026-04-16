'use strict';

const { XMLParser } = require('fast-xml-parser');

class PubMedXmlParser {
  constructor() {
    this._parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      trimValues: true,
      isArray: (tag) =>
        ['PubmedArticle', 'Author', 'AbstractText', 'PublicationType'].includes(tag),
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Parse a full PubMed efetch XML string → array of normalized articles. */
  parseArticles(xmlString) {
    if (!xmlString) return [];
    try {
      const root = this._parser.parse(xmlString);
      const rawArticles = root?.PubmedArticleSet?.PubmedArticle;
      if (!rawArticles) return [];
      const articles = Array.isArray(rawArticles) ? rawArticles : [rawArticles];
      return articles.map((a) => this._normalizeArticle(a)).filter(Boolean);
    } catch (err) {
      console.error('[XmlParser] Parse error:', err.message);
      return [];
    }
  }

  /** Parse a single PubmedArticle node — useful for unit tests. */
  parseSingleArticle(articleNode) {
    return this._normalizeArticle(articleNode);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  _normalizeArticle(node) {
    try {
      const medline = node?.MedlineCitation;
      const article = medline?.Article;
      if (!medline || !article) return null;

      const pmidRaw = medline.PMID;
      const pmid = pmidRaw != null
        ? String(typeof pmidRaw === 'object' ? pmidRaw['#text'] ?? pmidRaw : pmidRaw).trim()
        : null;

      const titleRaw = article.ArticleTitle;
      const title = titleRaw != null
        ? (typeof titleRaw === 'object' ? titleRaw['#text'] ?? '' : String(titleRaw)).trim()
        : null;

      return {
        pmid,
        title: title || null,
        abstract:          this._extractAbstract(article.Abstract),
        authors:           this._extractAuthors(article.AuthorList),
        year:              this._extractYear(article.Journal),
        journal:           article.Journal?.Title ?? null,
        publicationTypes:  this._extractPublicationTypes(article.PublicationTypeList),
        source:            'PubMed',
      };
    } catch (err) {
      console.error('[XmlParser] Article normalization error:', err.message);
      return null;
    }
  }

  _extractAbstract(abstractNode) {
    const nodes = abstractNode?.AbstractText;
    if (!nodes) return null;
    const arr = Array.isArray(nodes) ? nodes : [nodes];
    const parts = arr.map((n) => {
      if (typeof n === 'string') return n;
      if (typeof n === 'object') {
        const label = n['@_Label'];
        const text  = n['#text'] ?? '';
        return label && text ? `${label}: ${text}` : text;
      }
      return '';
    });
    return parts.filter(Boolean).join(' ').trim() || null;
  }

  _extractAuthors(authorListNode, max = 10) {
    const raw = authorListNode?.Author;
    if (!raw) return [];
    const authors = (Array.isArray(raw) ? raw : [raw]).slice(0, max);
    const formatted = authors.map((a) => {
      if (typeof a !== 'object') return String(a);
      if (a.LastName && a.ForeName) return `${a.LastName}, ${a.ForeName}`;
      return a.LastName ?? a.CollectiveName ?? '';
    }).filter(Boolean);
    if ((Array.isArray(raw) ? raw : [raw]).length > max) formatted.push('et al.');
    return formatted;
  }

  _extractYear(journalNode) {
    const pubDate = journalNode?.JournalIssue?.PubDate;
    if (!pubDate) return null;
    const pd = Array.isArray(pubDate) ? pubDate[0] : pubDate;
    if (pd?.Year) return parseInt(pd.Year, 10);
    if (pd?.MedlineDate) {
      const m = String(pd.MedlineDate).match(/\d{4}/);
      return m ? parseInt(m[0], 10) : null;
    }
    return null;
  }

  _extractPublicationTypes(listNode) {
    const types = listNode?.PublicationType;
    if (!types) return [];
    return (Array.isArray(types) ? types : [types])
      .map((t) => (typeof t === 'object' ? t['#text'] ?? '' : String(t)))
      .filter(Boolean);
  }
}

// Export a singleton instance so callers don't manage instantiation
const xmlParser = new PubMedXmlParser();

module.exports = {
  parseArticles:      (xml) => xmlParser.parseArticles(xml),
  parseSingleArticle: (node) => xmlParser.parseSingleArticle(node),
};
