import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { useInitializePermission } from "@/entities/user";
import routes from "~react-pages";

const App = () => {
  useInitializePermission();
  return (
    <div>
      <span>asdasd</span>
      <Suspense fallback={null}>{useRoutes(routes)}</Suspense>
    </div>
  );
};

export default App;
