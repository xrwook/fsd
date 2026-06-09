export type TRole = "admin" | "editor" | "viewer";

export type TPagePermission = "home" | "post-list" | "admin";

export type TActionPermission =
	| "post:create"
	| "post:filter"
	| "post:delete"
	| "button:export";

export interface TPermissionSet {
	pages: TPagePermission[];
	actions: TActionPermission[];
}

export interface TPermissionApiResponse {
	userId: string;
	role: TRole;
	permissions: TPermissionSet;
}
