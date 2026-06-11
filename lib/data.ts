import type { ComponentType } from "react";
import {
  BarChart3,
  Blocks,
  Bot,
  BriefcaseBusiness,
  CircleDollarSign,
  Database,
  FormInput,
  Globe2,
  Mail,
  Map,
  MapPin,
  MousePointer2,
  Network,
  Phone,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import type { IconType } from "react-icons";
import {
  SiClaude,
  SiFigma,
  SiGithub,
  SiJavascript,
  SiMeta,
  SiMongodb,
  SiN8N,
  SiNextdotjs,
  SiOpenai,
  SiPostgresql,
  SiPython,
  SiRailway,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiVercel,
  SiZapier,
} from "react-icons/si";
import { FaAmazon, FaGithub, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { VscVscode } from "react-icons/vsc";

export type NavLink = {
  label: string;
  href: string;
};

export type FeaturedCategory =
  | "Websites"
  | "AI Systems"
  | "Digital Products"
  | "Growth Work";

export type FeaturedProject = {
  name: string;
  type: string;
  category: FeaturedCategory;
  image: string;
  icon: ComponentType<{ className?: string }>;
};

export type BuildCard = {
  title: string;
  copy: string;
  outcome: string;
  icon: ComponentType<{ className?: string }>;
};

export type SystemStep = {
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  accent?: "blue" | "yellow";
};

export type ToolItem = {
  name: string;
  icon?: IconType;
  color: string;
  short?: string;
};

export const navLinks: NavLink[] = [
  { label: "Work", href: "#work" },
  { label: "Build", href: "#build" },
  { label: "System", href: "#system" },
  { label: "Tools", href: "#tools" },
  { label: "Contact", href: "#contact" },
];

export const heroRoles = [
  "Full Stack Developer",
  "AI Automation Engineer",
  "Digital Systems Builder",
  "Ecommerce Operator",
  "Media Buyer",
];

export const orbitProjects = [
  {
    name: "Aegis",
    detail: "Systems",
    logo: "/logos/aegis-logo.png",
    logoAlt: "Aegis Systems logo",
    position: "leftTop",
  },
  {
    name: "GarageAI",
    detail: "Diagnostics",
    logo: "/logos/garageai-logo.png",
    logoAlt: "GarageAI logo",
    position: "leftMid",
  },
  {
    name: "FixIt",
    detail: "Service App",
    logo: "/logos/fixit-logo.png",
    logoAlt: "FixIt logo",
    position: "leftBottom",
  },
  {
    name: "Mall Maps",
    detail: "Navigation",
    logo: "/logos/mall-maps-logo.png",
    logoAlt: "Mall Maps logo",
    position: "rightTop",
  },
  {
    name: "Greenfield",
    detail: "Accounting",
    logo: "/logos/greenfield-logo.png",
    logoAlt: "Greenfield Accounting logo",
    position: "rightMid",
  },
  {
    name: "NAMI",
    detail: "Studio",
    logo: "/logos/nami-logo.png",
    logoAlt: "NAMI Studio logo",
    position: "rightBottom",
  },
];

export const projectFilters = [
  "All",
  "Websites",
  "AI Systems",
  "Digital Products",
  "Growth Work",
] as const;

export const featuredProjects: FeaturedProject[] = [
  {
    name: "Aegis Systems",
    type: "Operational Clarity Platform",
    category: "AI Systems",
    image: "/projects/aegis-systems.png",
    icon: Bot,
  },
  {
    name: "GarageAI",
    type: "AI Vehicle Diagnostics",
    category: "AI Systems",
    image: "/projects/garage-ai.png",
    icon: Network,
  },
  {
    name: "FixIt App",
    type: "On Demand Service Platform",
    category: "Digital Products",
    image: "/projects/fixit-app-mockup.png",
    icon: Blocks,
  },
  {
    name: "FixIt Website",
    type: "Repair Service Landing Page",
    category: "Websites",
    image: "/projects/fixit.png",
    icon: Globe2,
  },
  {
    name: "Mall Maps",
    type: "Mall Navigation App",
    category: "Digital Products",
    image: "/projects/mall-maps-app-mockup.png",
    icon: Map,
  },
  {
    name: "Mall Maps Website",
    type: "Navigation App Landing Page",
    category: "Websites",
    image: "/projects/mall-maps.png",
    icon: Globe2,
  },
  {
    name: "Greenfield Accounting",
    type: "Accounting Firm Website",
    category: "Websites",
    image: "/projects/greenfield-accounting.png",
    icon: BriefcaseBusiness,
  },
  {
    name: "LTO Site Improvement",
    type: "Government Service Redesign",
    category: "Websites",
    image: "/projects/lto-govt-site-improvement.png",
    icon: Globe2,
  },
  {
    name: "Reign Models Manila",
    type: "Modeling Agency Website",
    category: "Growth Work",
    image: "/projects/modeling-agency.png",
    icon: TrendingUp,
  },
  {
    name: "NAMI Studio",
    type: "Creative Studio Website",
    category: "Websites",
    image: "/projects/nami-studio.png",
    icon: Globe2,
  },
  {
    name: "Parea Collective",
    type: "Operating Layer Website",
    category: "Growth Work",
    image: "/projects/parea.png",
    icon: TrendingUp,
  },
  {
    name: "Parea Systems",
    type: "Business Ecosystem Website",
    category: "Growth Work",
    image: "/projects/parea-v2.png",
    icon: TrendingUp,
  },
  {
    name: "PetMates Platform",
    type: "Pet Matching Product",
    category: "Digital Products",
    image: "/projects/petmates-v1.png",
    icon: Blocks,
  },
  {
    name: "PetMates Website",
    type: "Pet Social App Website",
    category: "Websites",
    image: "/projects/petmates-v2.png",
    icon: Globe2,
  },
];

export const buildCards: BuildCard[] = [
  {
    title: "Web Experiences",
    copy: "High performance websites that look premium, rank well, and convert visitors into customers.",
    outcome: "More leads and sales",
    icon: MousePointer2,
  },
  {
    title: "AI Workflows",
    copy: "Automate repetitive tasks and connect your tools so everything runs while you focus on growth.",
    outcome: "Save time and reduce cost",
    icon: Workflow,
  },
  {
    title: "Business Systems",
    copy: "End to end systems that organize your operations, pipeline, and data for smarter decisions.",
    outcome: "Scalable and predictable growth",
    icon: BarChart3,
  },
];

export const systemSteps: SystemStep[] = [
  {
    label: "Traffic",
    description: "Attract the right audience",
    icon: Users,
  },
  {
    label: "Website",
    description: "Deliver value and build trust",
    icon: Globe2,
  },
  {
    label: "Lead Capture",
    description: "Convert visitors into leads",
    icon: FormInput,
  },
  {
    label: "Automation",
    description: "Nurture and follow up 24/7",
    icon: Zap,
  },
  {
    label: "CRM",
    description: "Organize and manage relationships",
    icon: Database,
  },
  {
    label: "Sales",
    description: "Close more deals",
    icon: CircleDollarSign,
  },
  {
    label: "Growth",
    description: "Scale and optimize continuously",
    icon: TrendingUp,
    accent: "yellow",
  },
];

export const tools: ToolItem[] = [
  { name: "n8n", icon: SiN8N, color: "#EA4B71" },
  { name: "VS Code", icon: VscVscode, color: "#007ACC" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
  { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "Zapier", icon: SiZapier, color: "#FF4F00" },
  { name: "Railway", icon: SiRailway, color: "#F5F5F5" },
  { name: "Supabase", icon: SiSupabase, color: "#3ECF8E" },
  { name: "OpenAI", icon: SiOpenai, color: "#10A37F" },
  { name: "Claude", icon: SiClaude, color: "#D97757" },
  { name: "Codex", icon: SiOpenai, color: "#F5F5F5" },
  { name: "Figma", icon: SiFigma, color: "#F24E1E" },
  { name: "Meta Ads", icon: SiMeta, color: "#0467DF" },
  { name: "Amazon", icon: FaAmazon, color: "#FF9900" },
  { name: "REST APIs", color: "#8B5CF6", short: "REST" },
  { name: "Next.js", icon: SiNextdotjs, color: "#F5F5F5" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38BDF8" },
  { name: "GitHub", icon: SiGithub, color: "#F5F5F5" },
  { name: "Vercel", icon: SiVercel, color: "#F5F5F5" },
];

export const contactChannels = [
  { label: "hello@chester.studio", href: "mailto:hello@chester.studio", icon: Mail },
  { label: "+63 9606 613 136", href: "tel:+639606613136", icon: Phone },
  { label: "Negros Occidental, Philippines", href: "#contact", icon: MapPin },
];

export const socialLinks = [
  { label: "X", href: "https://x.com", icon: FaXTwitter },
  { label: "LinkedIn", href: "https://linkedin.com", icon: FaLinkedinIn },
  { label: "GitHub", href: "https://github.com", icon: FaGithub },
  { label: "Email", href: "mailto:hello@chester.studio", icon: Mail },
];
