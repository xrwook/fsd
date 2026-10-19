import type { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  description?: string;
}

export const StationEmptyCase = ({ icon, description }: Props) => {
  return (
    <div className="flex h-36 flex-col items-center justify-center gap-2 text-center">
      {icon}
      <p className="typo-body-16-medium text-text-neutral-weak whitespace-pre-line">
        {description}
      </p>
    </div>
  );
};
