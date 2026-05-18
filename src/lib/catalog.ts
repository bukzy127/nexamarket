import type { Category } from "@/types";

export const CATEGORIES: ("All" | Category)[] = [
  "All",
  "Architectural Plans",
  "Structural Engineering",
  "BIM & CAD Models",
  "Project Specifications",
  "Cost Estimation",
  "Safety & Compliance",
];

export const SORT_OPTIONS = [
  "Newest",
  "Price: Low→High",
  "Price: High→Low",
  "Top Rated",
  "Most Sold",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];
