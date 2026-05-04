import type { Category, Project } from "@/types";

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: 1,
    title: "High-Rise Residential Tower — Full Blueprint Set",
    category: "Architectural Plans",
    price: 28.0,
    owner: "0x3fA8...c91D",
    rating: 4.9,
    reviews: 41,
    tags: ["AutoCAD", "PDF", "DWG"],
    preview: "#0d2040",
    featured: true,
    sales: 63,
    description:
      "Complete architectural drawing set for a 24-storey residential tower. Includes floor plans, elevations, sections, and details. AutoCAD 2024 + PDF.",
  },
  {
    id: 2,
    title: "BIM Model — Commercial Office Complex",
    category: "BIM & CAD Models",
    price: 45.0,
    owner: "inj1k7f...p2wq",
    rating: 4.7,
    reviews: 29,
    tags: ["Revit", "IFC", "BIM"],
    preview: "#1a0d40",
    featured: true,
    sales: 38,
    description:
      "Fully coordinated Revit BIM model for a 10-storey commercial office. LOD 350. Includes architecture, structure, and MEP coordination.",
  },
  {
    id: 3,
    title: "Reinforced Concrete Frame — Structural Calculations",
    category: "Structural Engineering",
    price: 18.5,
    owner: "0xB77a...3E2f",
    rating: 4.8,
    reviews: 55,
    tags: ["PDF", "XLSX", "Eurocode"],
    preview: "#0d3020",
    featured: false,
    sales: 112,
    description:
      "Complete structural design calculations for an RC frame building to Eurocode 2. Includes foundation, columns, beams, slabs.",
  },
  {
    id: 4,
    title: "BOQ Master Template — Civil Works",
    category: "Cost Estimation",
    price: 9.5,
    owner: "inj1p3x...r8kl",
    rating: 4.6,
    reviews: 88,
    tags: ["Excel", "CSV", "NRM2"],
    preview: "#2d1a00",
    featured: false,
    sales: 247,
    description:
      "Comprehensive Bill of Quantities template for civil works. NRM2 compliant. Covers earthworks, drainage, roads, and landscaping.",
  },
  {
    id: 5,
    title: "MEP Full Design Package — Hospital Building",
    category: "BIM & CAD Models",
    price: 62.0,
    owner: "0x91Ac...7bE3",
    rating: 4.9,
    reviews: 18,
    tags: ["Revit MEP", "DWG", "HVAC"],
    preview: "#001a2d",
    featured: true,
    sales: 24,
    description:
      "Complete MEP design for a 200-bed hospital facility. HVAC, plumbing, electrical, fire protection. Revit 2024 + AutoCAD.",
  },
  {
    id: 6,
    title: "Site Safety Management Plan Template",
    category: "Safety & Compliance",
    price: 5.5,
    owner: "inj1q9w...m5nt",
    rating: 4.4,
    reviews: 134,
    tags: ["DOCX", "PDF", "ISO 45001"],
    preview: "#1a001a",
    featured: false,
    sales: 389,
    description:
      "Comprehensive construction site safety plan compliant with ISO 45001. Includes risk register, method statements, COSHH assessments.",
  },
  {
    id: 7,
    title: "Steel Connection Details — Full Library",
    category: "Structural Engineering",
    price: 22.0,
    owner: "0x5D2c...aF91",
    rating: 4.8,
    reviews: 37,
    tags: ["AutoCAD", "DWG", "Eurocode 3"],
    preview: "#0a0020",
    featured: false,
    sales: 91,
    description:
      "200+ standard steel connection details to Eurocode 3. Moment connections, base plates, splice joints. AutoCAD DWG format.",
  },
  {
    id: 8,
    title: "Topographic Survey Data — Urban Site",
    category: "Project Specifications",
    price: 14.0,
    owner: "inj1zx5...q3pr",
    rating: 4.5,
    reviews: 22,
    tags: ["DXF", "LAS", "GIS"],
    preview: "#1a1000",
    featured: false,
    sales: 45,
    description:
      "High-resolution topographic survey data for a 5-hectare urban development site. LiDAR point cloud + processed DXF contours.",
  },
  {
    id: 9,
    title: "Facade Engineering Specification Pack",
    category: "Project Specifications",
    price: 16.5,
    owner: "0xA1F9...8dC2",
    rating: 4.7,
    reviews: 31,
    tags: ["PDF", "DOCX", "NBS"],
    preview: "#001a10",
    featured: false,
    sales: 77,
    description:
      "Full facade engineering specification package. Curtain walling, cladding, glazing systems. NBS format, suitable for UK/EU projects.",
  },
];

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

export function findProject(id: number | string): Project | undefined {
  const num = typeof id === "string" ? Number(id) : id;
  return SAMPLE_PROJECTS.find((p) => p.id === num);
}
