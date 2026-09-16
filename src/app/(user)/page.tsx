import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { LandingView } from "./landing-view";

export default async function HomePage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin/dashboard");
  }

  return <LandingView />;
}
