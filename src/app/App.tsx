import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { useInitializeMenuPermission } from "@/entities/user";
import routes from "~react-pages";

const App = () => {
  useInitializeMenuPermission();
  return (
    <div>
      <span>asdasd</span>
      <Suspense fallback={null}>{useRoutes(routes)}</Suspense>
    </div>
  );
};

export default App;
