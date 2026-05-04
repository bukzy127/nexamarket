import { TOKENS } from "@/lib/tokens";
import Card from "./Card";
import Icon, { type IconName } from "./Icon";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  icon: IconName;
  color?: "cyan" | "green" | "gold" | "violet";
}

export default function StatCard({
  label,
  value,
  delta,
  icon,
  color = "cyan",
}: StatCardProps) {
  const c =
    color === "cyan"
      ? TOKENS.cyan
      : color === "green"
        ? TOKENS.green
        : color === "gold"
          ? TOKENS.gold
          : "#a78bfa";
  return (
    <Card style={{ padding: "20px 24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: TOKENS.textMuted,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${c}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon} size={16} color={c} />
        </div>
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: TOKENS.text,
          marginBottom: 6,
        }}
      >
        {value}
      </div>
      {delta && (
        <div
          style={{
            fontSize: 12,
            color: delta.startsWith("+") ? TOKENS.green : TOKENS.red,
            fontWeight: 500,
          }}
        >
          {delta} from last 30d
        </div>
      )}
    </Card>
  );
}
