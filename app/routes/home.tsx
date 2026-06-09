import type { Route } from "@/routes/+types/home";
import HomePage from "@/pages/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FSD Test" },
    { name: "description", content: "Feature-Sliced Design starter app" },
  ];
}

const Home = () => {
  return <HomePage />;
};

export default Home;
