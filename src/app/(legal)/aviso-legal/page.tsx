import type { Metadata } from "next";
import { getDictionary } from "@/content";
import { LegalPageView } from "../LegalPageView";

const t = getDictionary();
const page = t.legal["aviso-legal"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: "/aviso-legal" },
  openGraph: { title: page.title, description: page.description, url: "/aviso-legal" },
};

export default function Page() {
  return <LegalPageView page={page} backLabel="Volver al inicio" />;
}
