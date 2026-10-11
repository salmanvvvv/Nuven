import type { SiteContent } from "@/content/types";

type Name = SiteContent["social"][number]["icon"];

const paths: Record<Name, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V16M8 7.6v.1M11.5 16v-3.2c0-1.5 1-2.3 2.1-2.3 1.2 0 1.9.8 1.9 2.3V16M11.5 10.5V16" />
    </>
  ),
  x: <path d="M4.5 4h4L19.5 20h-4zM19 4l-6.2 7M5 20l6.2-7" />,
  dribbble: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9.5c5 .4 10.3-.6 14.6-3.6M7 19.5c2.3-4.6 6.6-7 13.4-5.6M9 3.5c3 3.6 5.2 9.2 6 17" />
    </>
  ),
};

export function SocialIcon({ name, className }: { name: Name; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
