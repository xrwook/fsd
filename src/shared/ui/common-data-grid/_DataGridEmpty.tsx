import { Typography } from '@hae-fe/elements';
import { Icon3dEmptyCaseNoResults } from '@hae-fe/icon-library/react/3d';

// TODO: 이미지에서 잘린 원본 IC_3D_WARNING import 경로 확인 필요.
import IC_3D_WARNING from '@/shared/assets/images/ic_3d_warning.png';
import { Empty } from '@/shared/ui/empty';

type DataGridEmptyProps = {
  message?: string;
};

const NO_DATA_FILTER_TITLE = '검색 결과가 없습니다.';
const NO_DATA_FILTER = '검색어에 오타가 없는지 확인하거나, \n 다른 검색어를 입력해 보세요.';
const NO_DATA = '데이터가 없습니다.';
const NO_DATA_ERROR = '일시적인 오류가 발생했습니다. \n 나중에 다시 시도해보세요.';

export const DataGridEmptyError = () => {
  return (
    <div className="noRowsOverlay pointer-events-auto">
      <div className={'flex flex-col items-center justify-center gap-4 p-5'}>
        <img src={IC_3D_WARNING} style={{ width: '100px' }} alt="오류" />
        <div className="flex flex-col items-center justify-center gap-1.5">
          <Typography
            hdsProps={{ size: '15', type: 'body' }}
            className="text-center whitespace-pre-line text-(--color-text-neutral-stronger)"
          >
            {NO_DATA_ERROR}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export const DataGridEmptyFilter = () => {
  return (
    <div className="noRowsOverlay pointer-events-auto">
      <Empty
        title={NO_DATA_FILTER_TITLE}
        text={NO_DATA_FILTER}
        icon={<Icon3dEmptyCaseNoResults style={{ width: '100px' }} />}
      />
    </div>
  );
};

export const DataGridEmpty = ({ message }: DataGridEmptyProps) => {
  return (
    <div className="noRowsOverlay pointer-events-auto">
      <Empty text={message ?? NO_DATA} />
    </div>
  );
};

export const DataGridSmallEmpty = ({ message }: DataGridEmptyProps) => {
  return (
    <div className="noRowsOverlay small pointer-events-auto">
      <Typography
        hdsProps={{ size: '15', type: 'body' }}
        className="text-center whitespace-pre-line text-(--color-text-neutral-stronger)"
      >
        {message ?? NO_DATA}
      </Typography>
    </div>
  );
};
