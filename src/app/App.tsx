import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { useInitializePermission } from "@/entities/user";
import routes from "~react-pages";

const App = () => {
  useInitializePermission();

  return <Suspense fallback={null}>{useRoutes(routes)}</Suspense>;
};

export default App;
