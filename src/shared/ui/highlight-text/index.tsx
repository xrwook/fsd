interface HighlightTextProps {
  keyword: string;
  text: string;
}

export const HighlightText = ({ keyword, text }: HighlightTextProps) => {
  if (!keyword) return text;

  const matchIndex = text
    .toLocaleLowerCase()
    .indexOf(keyword.toLocaleLowerCase());

  if (matchIndex === -1) return text;

  const matchEnd = matchIndex + keyword.length;

  return (
    <>
      {text.slice(0, matchIndex)}
      <mark className="bg-transparent font-bold">
        {text.slice(matchIndex, matchEnd)}
      </mark>
      {text.slice(matchEnd)}
    </>
  );
};
