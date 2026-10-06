import { MinusIcon, PlusIcon } from "@/shared/assets/icons";

interface Props {
  display: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const MapControl = ({ display, onZoomIn, onZoomOut }: Props) => {
  return (
    <div className="absolute right-10 bottom-10 z-1 flex flex-col gap-[1.6px]">
      <button
        className="bg-surface-inverse-strongest flex items-center justify-center rounded-t-[20px] rounded-b-sm p-3 shadow-[0_1.6px_3.2px_0_rgba(0,0,0,0.06)]"
        disabled={display <= 7}
        type="button"
        onClick={() => onZoomIn()}
      >
        <div className="icon-size-md">
          <PlusIcon className="text-icon-neutral-stronger" />
        </div>
      </button>
      <button
        className="bg-surface-inverse-strongest flex items-center justify-center rounded-t-sm rounded-b-[20px] p-3 shadow-[0_1.6px_3.2px_0_rgba(0,0,0,0.06)]"
        disabled={display > 21}
        type="button"
        onClick={() => onZoomOut()}
      >
        <div className="icon-size-md">
          <MinusIcon className="text-icon-neutral-stronger" />
        </div>
      </button>
    </div>
  );
};

export default MapControl;
