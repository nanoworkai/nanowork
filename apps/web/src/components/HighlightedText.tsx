import { getSearchMatches } from "../lib/marketplace";

/**
 * HighlightedText Component
 *
 * Displays text with highlighted search matches.
 * Used in business cards to show what matched the user's search.
 */

type HighlightedTextProps = {
  text: string;
  searchQuery: string;
  className?: string;
  highlightClassName?: string;
};

export default function HighlightedText({
  text,
  searchQuery,
  className = "",
  highlightClassName = "bg-yellow-400/20 text-yellow-300",
}: HighlightedTextProps) {
  if (!searchQuery.trim()) {
    return <span className={className}>{text}</span>;
  }

  const matches = getSearchMatches(text, searchQuery);

  return (
    <span className={className}>
      {matches.map((match, index) => (
        <span
          key={index}
          className={match.highlight ? highlightClassName : ""}
        >
          {match.text}
        </span>
      ))}
    </span>
  );
}
