import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return customTwMerge(clsx(...inputs));
};

export const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      z: [{ z: [() => true] }],
    },
  },
});
