import { TOKENS } from "@/lib/tokens";
import Icon from "./ui/Icon";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${TOKENS.border}`,
        padding: "40px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: "linear-gradient(135deg, #00d4ff, #0050e6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="building" size={13} color="#000" />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: TOKENS.text }}>
          NexaMarket
        </span>
      </div>
      <span style={{ fontSize: 12, color: TOKENS.textDim }}>
        Powered by Injective · IPFS · Firebase
      </span>
      <span style={{ fontSize: 12, color: TOKENS.textDim }}>
        © {new Date().getFullYear()} NexaMarket
      </span>
    </footer>
  );
}
