import type { Route } from "@/routes/+types/home";
import { hasMenuPermission } from "@/entities/user/lib/permission/config";
import { getUserPermissionApi } from "@/entities/user/api";
import HomePage from "@/pages/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FSD Test" },
    { name: "description", content: "Feature-Sliced Design starter app" },
  ];
}

export async function loader() {
  try {
    const response = await getUserPermissionApi();

    if (!hasMenuPermission(response.permissions, "dashboard", "read")) {
      throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
    }

    return null;
  } catch {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }
}

const Home = () => {
  return <HomePage />;
};

export default Home;
