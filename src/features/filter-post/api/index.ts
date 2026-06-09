import type { TPost } from "@/entities/post";

export const filterPostsApi = (posts: TPost[], keyword: string) => {
  return posts.filter((post) => post.title.includes(keyword));
};
