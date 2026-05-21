# Add Mock JSON Response

Create a new mock JSON response file following the project schema.

## Arguments

$ARGUMENTS should contain: scenario name and overall sentiment.

Example usage: `/add-mock tech-crash bearish`

## Instructions

1. Parse the scenario name and sentiment from `$ARGUMENTS`.

2. Create the JSON file at `src/mocks/<scenario-name>.json` conforming to the `AnalysisResponse` interface from `src/types/index.ts`:

```json
{
  "status": "success",
  "timestamp": "<current ISO timestamp>",
  "source": "<appropriate source like Bloomberg, Reuters, Yahoo Finance>",
  "assets": [
    {
      "ticker": "<relevant ticker>",
      "name": "<company name>",
      "sentiment": "<bullish|bearish|neutral|unknown>",
      "impact": "<high|medium|low|none>",
      "impactColor": "<red|yellow|green|gray>",
      "summary": "<1-2 sentence explanation>",
      "confidenceScore": 0.85
    }
  ],
  "overallSentiment": "<sentiment from arguments>",
  "headline": "<realistic news headline matching the scenario>"
}
```

3. Rules:
   - Include 2-3 assets per mock
   - `impactColor` must match sentiment: bullish+high → green, bearish+high → red, medium → yellow, low/none → gray
   - `confidenceScore` between 0.0 and 1.0
   - Use realistic tickers and company names
   - Headline should sound like a real financial news headline

4. Update `src/services/analyze-impact.ts` to import and include the new mock in its rotation.

5. Commit:

```bash
git add src/mocks/<scenario-name>.json src/services/analyze-impact.ts
git commit -m "feat: add <scenario-name> mock data"
```
