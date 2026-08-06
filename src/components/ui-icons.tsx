type IconProps = {
  className?: string;
};

export function CloseIcon({ className = "button-icon" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" strokeLinecap="square" strokeWidth="1.8" />
    </svg>
  );
}

export function MenuIcon({ className = "button-icon" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 7h14M5 12h14M5 17h14" fill="none" stroke="currentColor" strokeLinecap="square" strokeWidth="1.8" />
    </svg>
  );
}

export function ThemeIcon({ className = "button-icon" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 5a7 7 0 0 1 0 14Z" fill="currentColor" />
    </svg>
  );
}

export function ArrowIcon({
  className = "button-icon",
  direction,
}: IconProps & { direction: "left" | "right" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d={direction === "left" ? "m14.5 5-7 7 7 7" : "m9.5 5 7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeWidth="1.8"
      />
    </svg>
  );
}
