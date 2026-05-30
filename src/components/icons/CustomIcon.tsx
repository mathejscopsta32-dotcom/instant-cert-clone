import { cn } from "@/lib/utils";

/**
 * JustMed custom icon set — exclusive SVG glyphs styled in the brand's green
 * palette. Used in place of system emojis across the site for a cohesive,
 * inclusive visual identity.
 */
type IconName =
  | "clock"
  | "mail"
  | "bolt"
  | "shield"
  | "scale"
  | "lock"
  | "money"
  | "check"
  | "monitor"
  | "stethoscope"
  | "flagBR"
  | "pencil"
  | "pix";

interface CustomIconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

const paths: Record<IconName, JSX.Element> = {
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  bolt: (
    <path
      d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  ),
  shield: (
    <>
      <path
        d="M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18" strokeLinecap="round" />
      <path d="M5 21h14" strokeLinecap="round" />
      <path d="M6 7h12" strokeLinecap="round" />
      <path
        d="M6 7 3 14a3 3 0 0 0 6 0L6 7Zm12 0-3 7a3 3 0 0 0 6 0l-3-7Z"
        strokeLinejoin="round"
      />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  money: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9v.01M18 15v.01" strokeLinecap="round" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" strokeLinecap="round" />
    </>
  ),
  stethoscope: (
    <>
      <path
        d="M5 3v6a4 4 0 0 0 8 0V3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 3h2M11 3h2" strokeLinecap="round" />
      <path
        d="M9 13v3a5 5 0 0 0 10 0v-2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="11" r="2.2" />
    </>
  ),
  flagBR: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="1.5" fill="#009C3B" stroke="none" />
      <path d="M12 8 5 12l7 4 7-4-7-4Z" fill="#FFDF00" stroke="none" />
      <circle cx="12" cy="12" r="2.4" fill="#002776" stroke="none" />
      <path d="M9.8 11.6c1.4-.5 3-.5 4.4 0" stroke="#fff" strokeWidth="0.7" fill="none" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4l10-10-4-4L4 16v4Z" strokeLinejoin="round" />
      <path d="m13.5 6.5 4 4" strokeLinecap="round" />
    </>
  ),
  pix: (
    <path
      d="M12 3 21 12l-9 9-9-9 9-9Zm0 4.5L7.5 12 12 16.5 16.5 12 12 7.5Z"
      strokeLinejoin="round"
    />
  ),
};

const filled: IconName[] = ["flagBR"];

export const CustomIcon = ({
  name,
  size = 24,
  className,
  ...props
}: CustomIconProps) => {
  const isFilled = filled.includes(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={isFilled ? "none" : "currentColor"}
      strokeWidth={1.8}
      className={cn("text-primary", className)}
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
};

export default CustomIcon;
