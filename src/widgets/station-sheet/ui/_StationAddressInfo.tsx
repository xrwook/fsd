import type { ChargingStationDetail } from "@/entities/charging-station";

interface Props {
  station: ChargingStationDetail;
  onCopyAddress?: () => void;
}

const StationAddressInfo = ({ station, onCopyAddress }: Props) => {
  return (
    <section className="mx-6 mb-5">
      <div className="flex items-center gap-1.5">
        <p className="text-text-neutral-stronger text-sm font-medium">
          {station.address}
        </p>
        <button
          className="text-text-primary-stronger text-sm font-semibold"
          type="button"
          onClick={onCopyAddress}
        >
          복사
        </button>
      </div>
      <p className="text-text-neutral-weaker mt-1 text-sm font-medium">
        {station.addressDetail}
      </p>
    </section>
  );
};

export default StationAddressInfo;
