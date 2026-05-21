# Add React Component

Create a new React component following project conventions.

## Arguments

$ARGUMENTS should contain: component name and a brief description of what it does.

Example usage: `/add-component sentiment-chart — displays a bar chart of sentiment scores`

## Instructions

1. Parse the component name from `$ARGUMENTS`. The name should be in kebab-case (e.g., `sentiment-chart`).

2. Create the component file at `src/popup/components/<name>.tsx`:

```typescript
interface <PascalName>Props {
  // Add props based on the description
}

export function <PascalName>({ ...props }: <PascalName>Props) {
  return (
    <div className="...">
      {/* Implementation based on description */}
    </div>
  );
}
```

3. Follow these conventions:
   - File name: kebab-case (e.g., `sentiment-chart.tsx`)
   - Component name: PascalCase (e.g., `SentimentChart`)
   - Use functional component with explicit props interface
   - Use Tailwind CSS for all styling
   - Import types from `src/types/index.ts` if the component uses Asset or AnalysisResponse data
   - No default exports — use named exports

4. After creating, commit:

```bash
git add src/popup/components/<name>.tsx
git commit -m "feat: add <PascalName> component"
```
