import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import StartProjectWizard from "@/components/start-project/StartProjectWizard";

export const metadata: Metadata = {
  title: "Démarrer un projet",
};

export default function StartProjectPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center py-24 md:py-32">
        <StartProjectWizard />
      </main>
    </>
  );
}
