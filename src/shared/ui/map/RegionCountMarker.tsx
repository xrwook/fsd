import { CustomOverlay } from "react-naver-maps";

interface Props {
  count: number;
  position: { lat: number; lng: number };
  onClick?: () => void;
}

export const RegionCountMarker = ({
  count,
  position,
  onClick: handleClick,
}: Props) => {
  return (
    <CustomOverlay position={position} zIndex={100}>
      <button
        className="border-poi-border-enabled bg-poi-surface-cluster shadow-bottom-xsmall flex aspect-square cursor-pointer items-center justify-center gap-1 rounded-full border px-4 whitespace-nowrap"
        style={{ transform: "translate(-50%, -50%)" }}
        type="button"
        onClick={handleClick}
      >
        <span className="typo-body-14-semibold text-text-neutral-stronger">
          {count.toLocaleString()}
        </span>
      </button>
    </CustomOverlay>
  );
};
