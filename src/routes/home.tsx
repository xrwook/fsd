import type { Route } from "@/routes/+types/home";
import { usePermission } from "@/entities/user";
import HomePage from "@/pages/home";
import NotFoundPage from "@/pages/not-found";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FSD Test" },
    { name: "description", content: "Feature-Sliced Design starter app" },
  ];
}

const Home = () => {
  const { canAccessPage } = usePermission();

  if (!canAccessPage("home")) {
    return <NotFoundPage />;
  }

  return <HomePage />;
};

export default Home;
