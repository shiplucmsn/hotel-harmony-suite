import { createFileRoute } from "@tanstack/react-router";
import { HrAttendancePage } from "@/modules/hr/pages/attendance-page";

export const Route = createFileRoute("/app/hr/attendance")({
  component: HrAttendancePage,
});

