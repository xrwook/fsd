import { z } from "zod";
import { MENU_ID_VALUES } from "@/entities/user/lib/permission/menuIds";

export const permissionKeySchema = z.enum(["read", "write", "download"]);
export const menuIdSchema = z.enum(MENU_ID_VALUES);

const menuPermissionBaseSchema = z.object({
  id: menuIdSchema,
  parentId: menuIdSchema.nullable(),
  depth: z.number(),
  name: z.string(),
  type: z.enum(["folder", "menu"]),
  url: z.string().nullable().optional(),
  expanded: z.boolean().optional(),
  checked: z.boolean(),
  permissions: z.object({
    read: z.boolean(),
    write: z.boolean(),
    download: z.boolean(),
  }),
});

type TMenuPermissionSchema = z.infer<typeof menuPermissionBaseSchema> & {
  children?: TMenuPermissionSchema[];
};

export const menuPermissionSchema: z.ZodType<TMenuPermissionSchema> = z.lazy(
  () =>
    menuPermissionBaseSchema.extend({
      children: z.array(menuPermissionSchema).optional(),
    }),
);

export const menuPermissionApiResponseSchema = z.object({
  permissionName: z.string(),
  permissionDescription: z.string(),
  permissions: z.array(menuPermissionSchema),
});
