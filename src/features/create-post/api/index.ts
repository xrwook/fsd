import { getPostByIdApi } from "@/entities/post";

export const createPostApi = async () => {
  const base = await getPostByIdApi("template");
  return { ...base, id: crypto.randomUUID() };
};
