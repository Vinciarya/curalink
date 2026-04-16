'use strict';

/**
 * tests/unit/xmlParser.test.js
 *
 * Tests cover:
 *   parseArticles — title/authors/year parsing, abstract concatenation,
 *                   source label, and defensive empty-input handling.
 */

const { parseArticles } = require('../../src/utils/xmlParser');

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SAMPLE_XML = `<?xml version="1.0"?>
<PubmedArticleSet>
  <PubmedArticle>
    <MedlineCitation>
      <PMID>39123456</PMID>
      <Article>
        <ArticleTitle>Deep brain stimulation for Parkinson's disease: a 2024 review</ArticleTitle>
        <Abstract>
          <AbstractText Label="BACKGROUND">DBS has been used for Parkinson's disease for decades.</AbstractText>
          <AbstractText Label="RESULTS">Patients showed significant motor improvement.</AbstractText>
        </Abstract>
        <AuthorList>
          <Author><LastName>Smith</LastName><ForeName>John A</ForeName></Author>
          <Author><LastName>Jones</LastName><ForeName>Mary</ForeName></Author>
        </AuthorList>
        <Journal>
          <Title>Neurology</Title>
          <JournalIssue><PubDate><Year>2024</Year></PubDate></JournalIssue>
        </Journal>
        <PublicationTypeList>
          <PublicationType>Randomized Controlled Trial</PublicationType>
        </PublicationTypeList>
      </Article>
    </MedlineCitation>
  </PubmedArticle>
</PubmedArticleSet>`;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('parseArticles', () => {
  test('parses title, authors, year correctly', () => {
    const articles = parseArticles(SAMPLE_XML);

    expect(articles.length).toBe(1);
    expect(articles[0].title).toContain('Deep brain stimulation');
    expect(articles[0].year).toBe(2024);
    expect(articles[0].authors).toContain('Smith, John A');
  });

  test('concatenates structured abstract sections', () => {
    const articles = parseArticles(SAMPLE_XML);

    expect(articles[0].abstract).toContain('DBS has been used');
    expect(articles[0].abstract).toContain('significant motor improvement');
  });

  test('sets correct source', () => {
    const articles = parseArticles(SAMPLE_XML);

    expect(articles[0].source).toBe('PubMed');
  });

  test('returns empty array for empty input', () => {
    expect(parseArticles('')).toEqual([]);
    expect(parseArticles(null)).toEqual([]);
  });
});
