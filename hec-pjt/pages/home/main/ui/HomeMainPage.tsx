import { PageLayout } from "@/widgets/layout/ui";

import { FavoriteMenuTable } from "./_FavoriteMenuTable";
import { NoticeSummaryList } from "./_NoticeSummaryList";
import { RecentMenuTable } from "./_RecentMenuTable";

const HomeMainPage = () => {
  return (
    <PageLayout title="홈" onFavoriteToggle={() => {}}>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <FavoriteMenuTable />
        <RecentMenuTable />
        <NoticeSummaryList />
      </div>
    </PageLayout>
  );
};

export default HomeMainPage;
