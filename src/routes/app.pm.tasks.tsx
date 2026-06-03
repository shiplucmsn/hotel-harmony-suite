import { createFileRoute } from "@tanstack/react-router";
import { TasksPage } from "@/modules/pm/pages/tasks-page";

export const Route = createFileRoute("/app/pm/tasks")({
  component: TasksPage,
});
