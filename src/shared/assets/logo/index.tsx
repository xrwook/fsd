import type { SVGProps } from "react";

export const LOGO_Epit = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label="E-pit"
    viewBox="0 0 40 14"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <text
      fill="currentColor"
      fontFamily="Arial, sans-serif"
      fontSize="12"
      fontWeight="700"
      x="0"
      y="11"
    >
      E-pit
    </text>
  </svg>
);

export const LOGO_Symbol_Epit = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label="E-pit"
    viewBox="0 0 14 14"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="7" cy="7" fill="currentColor" r="7" />
    <path d="M4 4h6v2H6v1h3v2H6v1h4v2H4V4Z" fill="white" />
  </svg>
);
