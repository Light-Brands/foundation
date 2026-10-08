import {
  LayoutDashboard, Gem, Bot, TrendingUp, HeartHandshake, Building2, Settings, Briefcase,
  Sun, MoreHorizontal, ExternalLink, ChevronLeft, ChevronRight, ChevronDown, Lock,
  Check, Stethoscope, Delete, Inbox, type LucideIcon,
} from "lucide-react";
import type { SectionId, TabId } from "@/lib/layout/sections";

export const SECTION_ICONS: Record<SectionId, LucideIcon> = {
  command: LayoutDashboard, brand: Gem, agentic: Bot, grow: TrendingUp, serve: HeartHandshake, run: Building2,
};

export const TAB_ICONS: Record<TabId, LucideIcon> = {
  today: Sun, brand: Gem, business: Briefcase, agentic: Bot, more: MoreHorizontal,
};

export { Settings, ExternalLink, ChevronLeft, ChevronRight, ChevronDown, Lock, Check, Stethoscope, Delete, Inbox };
