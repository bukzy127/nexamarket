const CONTRACT_ERRORS: Record<string, string> = {
  "0xd7ff5f1a": "This project is already registered on Injective.",
  "0x4c4f68ca":
    "This project is not registered on the current Injective contract. The seller may need to publish it again.",
  "0x82b42900": "This wallet is not authorized to perform that action.",
  "0x569e8c11":
    "The project price changed or the payment amount is incorrect. Refresh the page and try again.",
  "0xb6da71be": "You already own this project and cannot purchase it again.",
};

function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const value = error as {
      message?: unknown;
      shortMessage?: unknown;
      reason?: unknown;
      code?: unknown;
      data?: unknown;
      error?: unknown;
    };
    const parts = [
      value.shortMessage,
      value.reason,
      value.message,
      value.code,
      value.data,
      value.error,
    ];
    return parts
      .map((part) => {
        if (typeof part === "string") return part;
        try {
          return part ? JSON.stringify(part) : "";
        } catch {
          return "";
        }
      })
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

export function readableError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const raw = errorText(error);
  const lower = raw.toLowerCase();

  for (const [selector, message] of Object.entries(CONTRACT_ERRORS)) {
    if (lower.includes(selector)) return message;
  }

  if (
    lower.includes("user rejected") ||
    lower.includes("user denied") ||
    lower.includes("action_rejected") ||
    lower.includes("4001")
  ) {
    return "The request was cancelled in MetaMask.";
  }
  if (
    lower.includes("insufficient funds") ||
    lower.includes("insufficient balance")
  ) {
    return "Your wallet does not have enough INJ for this payment and its network fee.";
  }
  if (
    lower.includes("wrong network") ||
    lower.includes("unsupported chain") ||
    lower.includes("chain mismatch")
  ) {
    return "Switch MetaMask to Injective EVM Testnet and try again.";
  }
  if (
    lower.includes("projectnotfound") ||
    lower.includes("project not found")
  ) {
    return "This project is not registered on the current Injective contract. The seller may need to publish it again.";
  }
  if (lower.includes("ownercannotbuyownproject")) {
    return "You already own this project and cannot purchase it again.";
  }
  if (lower.includes("incorrectpayment")) {
    return "The project price changed. Refresh the page and try again.";
  }
  if (lower.includes("pinata is not configured") || lower.includes("pinata_jwt")) {
    return "Project uploads are temporarily unavailable because IPFS storage is not configured.";
  }
  if (
    lower.includes("public.profiles") ||
    lower.includes("schema cache")
  ) {
    return "Username storage is not ready yet. Please try again after the database setup is completed.";
  }
  if (
    lower.includes("521") ||
    lower.includes("web server is down") ||
    lower.includes("supabase is still waking up")
  ) {
    return "The application database is temporarily unavailable. Please try again shortly.";
  }
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network error") ||
    lower.includes("enotfound")
  ) {
    return "The network service could not be reached. Check your connection and try again.";
  }
  if (lower.includes("invalid wallet signature")) {
    return "Wallet verification failed. Please approve the new MetaMask signature request.";
  }
  if (
    lower.includes("execution reverted") ||
    lower.includes("call_exception") ||
    lower.includes("estimategas") ||
    lower.includes("transaction=") ||
    lower.includes("invocation=")
  ) {
    return "The Injective transaction was rejected by the smart contract.";
  }

  const cleaned = raw
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/0x[a-fA-F0-9]{16,}/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const looksTechnical =
    /[{}[\]=]|code_|exception|estimateGas|transaction|invocation/i.test(cleaned);

  if (cleaned && cleaned.length <= 180 && !looksTechnical) return cleaned;
  return fallback;
}
