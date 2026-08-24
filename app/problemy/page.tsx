import type { Metadata } from "next";

import { ProblemHub } from "@/components/problems/ProblemHub";

export const metadata: Metadata = {
  title: "Čo vás trápi? — Dental Centrum Dobeš",
  description: "Vyberte problém alebo oblasť a pozrite si možný ďalší krok v Dental Centrum Dobeš.",
};

export default function ProblemsPage() {
  return <ProblemHub />;
}
