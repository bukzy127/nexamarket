export type Category =
  | "Architectural Plans"
  | "Structural Engineering"
  | "BIM & CAD Models"
  | "Project Specifications"
  | "Cost Estimation"
  | "Safety & Compliance"
  | "MEP Design"
  | "Survey & Geotechnical";

export interface Project {
  /** Numeric id also used as the on-chain project id. */
  id: number;
  title: string;
  description: string;
  category: Category;
  /** Price in INJ. */
  price: number;
  /** Wallet address (or short form) of current owner. */
  owner: string;
  /** Public username resolved from the owner's wallet profile. */
  ownerUsername?: string;
  /** Original creator/seller wallet address. */
  creator?: string;
  rating: number;
  reviews: number;
  tags: string[];
  /** Primary preview image URL, with legacy colors supported as a fallback. */
  preview: string;
  /** Public preview image gateway URLs. */
  previewImages?: string[];
  featured: boolean;
  sales: number;
  /** Server-only IPFS gateway URL for the access-gated project package. */
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  storageProvider?: "supabase" | "supabase+ipfs" | "ipfs";
  storagePath?: string;
  /** IPFS content identifier (CIDv1). Present when the file has been pinned. */
  cid?: string;
  /** Public IPFS gateway URL — `https://<gateway>/ipfs/<cid>`. */
  ipfsUrl?: string;
  /** Server-only preview CIDs corresponding to previewImages. */
  previewCids?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Purchase {
  id: string;
  projectId: number;
  buyer: string;
  seller: string;
  price: string;
  txHash: string;
  timestamp: string;
}

export interface UserProfile {
  address: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type ActivityType = "upload" | "purchase" | "sale" | "download";

export interface Activity {
  id: string;
  wallet: string;
  type: ActivityType;
  projectId?: number;
  projectTitle?: string;
  counterparty?: string;
  counterpartyUsername?: string;
  amount?: string;
  txHash?: string;
  timestamp: string;
}

export type WalletType = "metamask";

export interface WalletState {
  address: string | null;
  type: WalletType | null;
  balance: string | null;
  connected: boolean;
}
