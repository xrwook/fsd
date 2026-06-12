import type { z } from "zod";
import type {
  menuPermissionSchema,
  menuPermissionApiResponseSchema,
  permissionKeySchema,
} from "@/entities/user/lib/permission/schema";

/**
 * 메뉴별로 검사할 수 있는 권한 키 타입입니다.
 */
export type TPermissionKey = z.infer<typeof permissionKeySchema>;

/**
 * API가 내려주는 재귀 메뉴 트리의 단일 노드 타입입니다.
 */
export type TMenuPermission = z.infer<typeof menuPermissionSchema>;

/**
 * 사용자 권한 조회 API의 응답 타입입니다.
 */
export type TMenuPermissionApiResponse = z.infer<
  typeof menuPermissionApiResponseSchema
>;
