import { Suspense } from "react";
import { AuthForm } from "@/components/account/AuthForm";

export const metadata = { title: "Connexion - Marché de Yama" };

type SearchParams = Promise<{ next?: string | string[] }>;

export default function ConnexionPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="px-4 py-12">
      <Suspense fallback={<p className="text-center text-black/60">Chargement…</p>}>
        <Form searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Form({ searchParams }: { searchParams: SearchParams }) {
  const { next } = await searchParams;

  return <AuthForm next={typeof next === "string" ? next : undefined} />;
}
