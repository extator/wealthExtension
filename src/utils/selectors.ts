interface SiteSelector {
  hostname: string;
  headlineSelectors: string[];
}

const siteSelectors: SiteSelector[] = [
  {
    hostname: "finance.yahoo.com",
    headlineSelectors: [
      'h1[data-test-locator="headline"]',
      "article h1",
      '[data-testid="article-title"]',
      "h1",
    ],
  },
  {
    hostname: "www.bloomberg.com",
    headlineSelectors: [
      "article header h1",
      '[class*="headline"]',
      "h1",
    ],
  },
  {
    hostname: "www.reuters.com",
    headlineSelectors: [
      '[data-testid="Heading"]',
      "article h1",
      "h1",
    ],
  },
  {
    hostname: "www.cnbc.com",
    headlineSelectors: [
      ".ArticleHeader-headline",
      'h1[class*="title"]',
      "h1",
    ],
  },
];

export function getSelectorsForSite(hostname: string): string[] {
  const site = siteSelectors.find((s) => hostname.includes(s.hostname));
  return site ? site.headlineSelectors : ["h1"];
}
