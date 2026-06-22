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
  /** Original creator/seller wallet address. */
  creator?: string;
  rating: number;
  reviews: number;
  tags: string[];
  /** Solid CSS color used for the engineering-grid preview backdrop. */
  preview: string;
  featured: boolean;
  sales: number;
  /** Server-only Supabase Storage download URL for the private project package. */
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  storageProvider?: "supabase" | "supabase+ipfs";
  storagePath?: string;
  /** IPFS content identifier (CIDv1). Present when the file has been pinned. */
  cid?: string;
  /** Public IPFS gateway URL — `https://<gateway>/ipfs/<cid>`. */
  ipfsUrl?: string;
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
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type WalletType = "metamask";

export interface WalletState {
  address: string | null;
  type: WalletType | null;
  balance: string | null;
  connected: boolean;
}
