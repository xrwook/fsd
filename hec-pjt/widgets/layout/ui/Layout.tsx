import { Typography } from '@hae-fe/elements';
import { useNavigationBreakpoint } from '@hae-fe/pattern';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';

import useNavigationStore from '../model/navigationStore';
import { Header } from './_Header';
import { Lnb } from './_Lnb';

type LayoutType = 'default' | 'noHeader' | 'noLnb';

// 헤더 + Lnb 둘다 없는 풀페이지
const NO_HEADER_PATHS = new Set(['']);
// 헤더 있고 LNB 없는 풀페이지
const NO_LNB_PATHS = new Set(['/']);

const getLayoutType = (pathname: string): LayoutType => {
  if (NO_HEADER_PATHS.has(pathname)) {
    return 'noHeader';
  }
  if (NO_LNB_PATHS.has(pathname)) {
    return 'noLnb';
  }
  return 'default';
};

export const Layout = ({ children }: PropsWithChildren) => {
  const [manualCollapsed, setManualCollapsed] = useState<boolean>(false);
  const { sidebarHidden } = useNavigationBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const setNavigation = useNavigationStore(
    (state) => state.navigationActions.setNavigation,
  );
  const navigation = useNavigationStore((state) => state.navigation);
  const layoutType = getLayoutType(location.pathname);
  const showPersistentLnb = layoutType === 'default'; // 데스크톱 상시 사이드바 여부
  const onMenuClick = () => {
    setDrawerOpen(true);
  };

  if (layoutType === 'noHeader') {
    return (
      <div className="flex h-dvh w-full min-w-5xl flex-col bg-(--color-light-background-neutral-weakest)">
        <main className="flex-1 overflow-auto">{children}</main>
        <div className="bg-(--color-light-background-neutral-weakest) px-10 py-6">
          <Typography
            className="font-light text-(--color-element-neutral-strong)"
            hdsProps={{ size: '13', type: 'body' }}
          >
            Copyright &copy; 2026 Hyundai Engineering Co.,LTD. All rights reserved.
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full min-w-5xl flex-col bg-white">
      <Header
        onMenuClick={onMenuClick}
        // manualCollapsed={manualCollapsed}
        // setManualCollapsed={setManualCollapsed}
        setNavigation={setNavigation}
        navigation={navigation}
        sidebarHidden={sidebarHidden}
      />
      <div className="relative flex flex-1 shrink flex-row overflow-hidden pt-14">
        <Lnb
          navigation={navigation}
          manualCollapsed={manualCollapsed}
          setManualCollapsed={setManualCollapsed}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
          showPersistentLnb={showPersistentLnb}
        />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 overflow-auto">{children}</main>
          <div className="px-10 py-6">
            <Typography
              className="font-light text-(--color-element-neutral-strong)"
              hdsProps={{ size: '13', type: 'body' }}
            >
              Copyright &copy; 2026 Hyundai Engineering Co.,LTD. All rights reserved.
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};
