/*
  Tailwind CSS line-height leading-* 클래스 요약

  클래스              | 줄 간격 값 | 설명
  --------------------|------------|------------------------
  leading-none        | 1          | 줄 간격 없음
  leading-tight       | 1.25       | 좁은 줄 간격
  leading-snug        | 1.375      | 기본보다 약간 좁은 줄 간격
  leading-normal      | 1.5        | 기본 줄 간격
  leading-relaxed     | 1.625      | 넉넉한 줄 간격
  leading-loose       | 2          | 매우 넉넉한 줄 간격

  참고: https://tailwindcss.com/docs/line-height
*/

/** font-Head */
export const heading1Clsx = "text-xl font-semibold text-gray-800 leading-7"; // 보통 타이틀
export const heading2Clsx = "text-lg font-semibold text-gray-700 leading-7"; // 서브타이틀

/** font-Body */
export const body1Clsx = "text-base font-normal text-gray-600 leading-snug";
export const body2Clsx = "text-sm font-normal text-gray-600 leading-snug";
export const body3Clsx = "text-xs font-normal text-gray-500 leading-snug";
