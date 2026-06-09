import { create } from "zustand";

interface TPostState {
  posts: TPost[];
  setPosts: (posts: TPost[]) => void;
}

type TPost = {
  id: string;
  title: string;
};

export const usePostStore = create<TPostState>((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
}));
