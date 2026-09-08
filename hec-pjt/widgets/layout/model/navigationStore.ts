import type { ScreenIdValues } from '@/shared/config';
import { createStore } from '@/shared/lib/zustand';

type NavigationState = {
  navigation: ScreenIdValues | null;
};

type NavigationActions = {
  navigationActions: {
    setNavigation: (navigation: ScreenIdValues | null) => void;
  };
};

type NavigationStore = NavigationActions & NavigationState;

const useNavigationStore = createStore<NavigationStore>(
  (set) => ({
    navigation: null,
    navigationActions: {
      setNavigation: (navigation) =>
        set((state) => {
          state.navigation = navigation;
        }),
    },
  }),
  'navigation',
  {
    usePersist: true,
    persistOptions: {
      partialize: (state) => ({ navigation: state.navigation }),
    },
  },
);

export default useNavigationStore;
