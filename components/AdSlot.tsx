type AdSlotVariant = "leaderboard" | "rectangle";

const SIZES: Record<AdSlotVariant, { w: number; h: number; label: string }> = {
  leaderboard: { w: 728, h: 90,  label: "AD SLOT — 728×90 leaderboard" },
  rectangle:   { w: 300, h: 250, label: "AD SLOT — 300×250 rectangle"  },
};

interface AdSlotProps {
  variant: AdSlotVariant;
  className?: string;
}

export function AdSlot({ variant, className = "" }: AdSlotProps) {
  const { w, h, label } = SIZES[variant];
  return (
    <div
      data-ad-slot={variant}
      aria-hidden="true"
      className={className}
      style={{
        width: w,
        height: h,
        maxWidth: "100%",
        background: "var(--bg-subtle)",
        border: "1px dashed var(--border)",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", userSelect: "none" }}>
        {label}
      </span>
    </div>
  );
}
