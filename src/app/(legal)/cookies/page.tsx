import type { Metadata } from "next";
import { getDictionary } from "@/content";
import { LegalPageView } from "../LegalPageView";

const t = getDictionary();
const page = t.legal["cookies"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: "/cookies" },
  openGraph: { title: page.title, description: page.description, url: "/cookies" },
};

export default function Page() {
  return <LegalPageView page={page} backLabel="Volver al inicio" />;
}
