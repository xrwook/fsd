import { z } from "zod";

export const permissionKeySchema = z.enum(["read", "write", "download"]);

const menuPermissionBaseSchema = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  depth: z.number(),
  name: z.string(),
  type: z.enum(["folder", "menu"]),
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

export const menuPermissionApiResponseSchema = z.array(menuPermissionSchema);
