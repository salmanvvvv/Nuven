import {
  Gauge,
  Headphones,
  LayoutTemplate,
  PenTool,
  RefreshCw,
  Search,
  ShoppingBag,
  Wrench,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/content/types";

const icons = {
  pen: PenTool,
  bag: ShoppingBag,
  layout: LayoutTemplate,
  refresh: RefreshCw,
  wrench: Wrench,
  search: Search,
  gauge: Gauge,
  headphones: Headphones,
} satisfies Record<IconName, React.ComponentType<LucideProps>>;

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Cmp = icons[name];
  return <Cmp aria-hidden strokeWidth={1.5} {...props} />;
}
