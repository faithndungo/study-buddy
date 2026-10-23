import { Cloud, GraduationCap } from "lucide-react";

export function BuddyMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-xl bg-brand text-primary-foreground shadow-glow"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Cloud style={{ width: size * 0.6, height: size * 0.6 }} strokeWidth={2.2} />
      <GraduationCap
        className="absolute"
        style={{ width: size * 0.32, height: size * 0.32, bottom: size * 0.2 }}
        strokeWidth={2.4}
      />
    </span>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <BuddyMark />
      <span className="leading-tight">
        <span className="block font-display text-base font-bold">AI Study Buddy</span>
        <span className="block text-xs text-muted-foreground">AZ-900 prep</span>
      </span>
    </span>
  );
}

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-muted-foreground ${className}`}>
      Independent study aid. Not an official Microsoft certification product and not endorsed by Microsoft.
    </p>
  );
}
