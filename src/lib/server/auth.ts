import { verifyMessage } from "ethers";

export function verifyWalletSignature(
  wallet: string,
  message: string,
  signature: string,
) {
  const recovered = verifyMessage(message, signature);
  if (recovered.toLowerCase() !== wallet.toLowerCase()) {
    throw new Error("Invalid wallet signature.");
  }
}
