import {
  Avatar,
  Divider,
  IconButton,
  TextButton,
  Typography,
} from "@hae-fe/elements";
import { IconClose } from "@hae-fe/icon-library/react";
import { useEffect, useRef } from "react";

interface ProfileProps {
  profile: {
    name: string;
    role: string;
    company: string;
    team: string;
    lastLoginAt: string;
    lastLoginIp: string;
  };
  open: boolean;
  anchorEl?: HTMLElement | null;
  onClose?: () => void;
  onLogout: () => void;
}

export const Profile = ({ profile, open, onClose, onLogout }: ProfileProps) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed top-12.5 right-5 z-50 w-90 border border-gray-200 bg-white pr-4 pl-6 shadow-lg"
    >
      {/* header */}
      <div className="flex items-center justify-between py-3">
        <Typography
          hdsProps={{ weight: "bold", type: "title", size: "17" }}
          className="text-(--color-text-neutral-strongest)"
        >
          내 프로필
        </Typography>
        <IconButton
          semantic="ghost"
          size="small"
          styleOption="fill"
          aria-label="닫기"
          onClick={onClose}
        >
          <IconClose size={20} type="outline" />
        </IconButton>
      </div>
      {/* content */}
      <div className="flex flex-col gap-6 pr-2">
        {/* 프로필 정보 */}
        <div className="flex flex-row items-center justify-start gap-6">
          <Avatar variant="noimage" size="large" />
          <div className="flex flex-col gap-0.5">
            <Typography
              hdsProps={{ weight: "bold", type: "title", size: "17" }}
              className="text-(--color-text-neutral-strongest)"
            >
              {profile.name} <span className="font-normal">{profile.role}</span>
            </Typography>
            <Typography
              hdsProps={{ weight: "regular", type: "body", size: "13" }}
              className="text-(--color-text-neutral-stronger)"
            >
              {profile.company}
            </Typography>
            <Typography
              hdsProps={{ weight: "regular", type: "body", size: "13" }}
              className="text-(--color-text-neutral-stronger)"
            >
              {profile.team}
            </Typography>
          </div>
        </div>
        <div className="h-full w-full">
          <Divider />
        </div>

        {/* 접속 이력 */}
        <div className="flex flex-col gap-2">
          <Typography
            hdsProps={{ weight: "regular", type: "title", size: "15" }}
            className="text-(--color-text-neutral-strongest)"
          >
            접속 이력
          </Typography>
          <div>
            <Typography
              hdsProps={{ weight: "regular", type: "body", size: "13" }}
              className="text-(--color-text-neutral-stronger)"
            >
              최종 접속일 : {profile.lastLoginAt}
            </Typography>
            <Typography
              hdsProps={{ weight: "regular", type: "body", size: "13" }}
              className="text-(--color-text-neutral-stronger)"
            >
              최종 접속 IP : {profile.lastLoginIp}
            </Typography>
          </div>
        </div>
      </div>
      {/* footer */}
      <div className="flex justify-end py-6 pr-2">
        <div>
          <TextButton semantic="neutral" size="medium" onClick={onLogout}>
            로그아웃
          </TextButton>
        </div>
      </div>
    </div>
  );
};
