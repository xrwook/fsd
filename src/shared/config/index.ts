export { env } from "./env";
export type { ScreenId, ScreenIdValues } from "./menu";
export { menu, SCREEN_ID } from "./menu";
export const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK_API !== "false";
