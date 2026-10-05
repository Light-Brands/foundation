import {
  LayoutDashboard, Megaphone, Handshake, PackageCheck, HeartHandshake, Wallet,
  Users, Target, Boxes, ShieldCheck, Settings, type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/lib/layout/categories";

export const ICONS: Record<IconName, LucideIcon> = {
  command: LayoutDashboard, attract: Megaphone, sell: Handshake, deliver: PackageCheck,
  keep: HeartHandshake, money: Wallet, team: Users, plan: Target, vendors: Boxes,
  risk: ShieldCheck, system: Settings,
};
