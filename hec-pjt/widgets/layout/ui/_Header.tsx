import { Avatar } from '@hae-fe/elements/atomic';
import {
  NavigationBar,
  NavigationGnbMenu,
  NavigationProfile,
  NavigationServiceName,
} from '@hae-fe/pattern';
import { Duration } from 'luxon';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useMainInfo } from '@/entities/user';
import Logo from '@/shared/assets/images/common/Logo.svg';
import type { MenuItem, ScreenIdValues } from '@/shared/config/menu';
import { getKeycloakTokenExpireSeconds } from '@/shared/lib/keycloak';
import { navigateToScreen } from '@/shared/lib/navigation/navigation';

import { Profile } from './_Profile';
import { QuickAccess } from './_QuickAccess';

interface Props {
  navigation: ScreenIdValues | null;
  onMenuClick: () => void;
  sidebarHidden: boolean;
  setNavigation: (navigation: ScreenIdValues) => void;
}

export const Header = ({
  navigation,
  onMenuClick,
  setNavigation,
  sidebarHidden,
}: Props) => {
  const {
    headerMenusData,
    findParentUrl,
    isMainInfoInitialized,
    findLastMenu,
    userInfo,
    partnerInfo,
  } = useMainInfo();
  const [remain, setRemain] = useState(() => getKeycloakTokenExpireSeconds());
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickOpen, setIsQuickOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const handleSelectGnbMenu = (menuItem: MenuItem) => {
    setNavigation(menuItem.screenId);
    // setManualCollapsed(false);
    navigate(menuItem.path);
    const first = findLastMenu(menuItem.screenId);
    if (!first?.screenId) return;
    navigateToScreen(first.screenId);
  };

  useEffect(() => {
    if (!isMainInfoInitialized) return;

    const topParent = findParentUrl(location.pathname);

    if (topParent?.screenId && navigation !== topParent.screenId) {
      setNavigation(topParent.screenId as ScreenIdValues);
    }
  }, [
    findParentUrl,
    isMainInfoInitialized,
    location.pathname,
    navigation,
    setNavigation,
  ]);

  useEffect(() => {
    const updateSec = () => setRemain(getKeycloakTokenExpireSeconds());
    updateSec();

    const interval = setInterval(updateSec, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatRemain = (seconds: number | null) => {
    if (!seconds) return '--:--';
    return Duration.fromObject({ seconds })
      .shiftTo('minutes', 'seconds')
      .toFormat('mm:ss');
  };

  return (
    <>
      <NavigationBar
        className="fixed z-10"
        expressive
        left={
          <NavigationServiceName
            className="cursor-pointer"
            logo={
              <img
                src={Logo}
                alt="현대엔지니어링"
                onClick={() => navigate('/')}
              />
            }
            serviceName="E-CMP"
            showMenu={sidebarHidden}
            showApps={true}
            expressive
            menuSelected={false}
            onMenuClick={onMenuClick}
            onAppsClick={() => setIsQuickOpen((prev) => !prev)}
          />
        }
        center={
          <div className="flex gap-7">
            {headerMenusData.map((item) => {
              return (
                <NavigationGnbMenu
                  key={item.label}
                  label={item.label}
                  selected={navigation === item.screenId}
                  onClick={() => handleSelectGnbMenu(item)}
                />
              );
            })}
          </div>
        }
        right={
          <>
            <span className="text-[15px] text-(--color-light-text-neutral-stronger)">
              {formatRemain(remain)}
            </span>
            <NavigationProfile
              name={`${userInfo?.adminName || '-'} `}
              companyName={`${partnerInfo?.partnerName || '-'}`}
              onClick={() => setIsProfileOpen((prev) => !prev)}
              avatar={
                <Avatar variant="image" size="xxsmall">
                  {userInfo?.adminName || '-'}
                </Avatar>
              }
            />
          </>
        }
      />
      {isQuickOpen && (
        <QuickAccess
          open={isQuickOpen}
          onClose={() => setIsQuickOpen(false)}
        />
      )}

      {isProfileOpen && (
        <Profile
          // profile={AdminProfile}
          open
          anchorEl={anchorRef.current}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
};
