"use client";

import {
  Home,
  Car,
  Bike,
  User,
  GraduationCap,
  Coins,
  Smartphone,
  CreditCard,
  Building2,
  HeartPulse,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  car: Car,
  bike: Bike,
  user: User,
  "graduation-cap": GraduationCap,
  coins: Coins,
  smartphone: Smartphone,
  "credit-card": CreditCard,
  "building-2": Building2,
  "heart-pulse": HeartPulse,
  "file-text": FileText,
};

interface LoanTypeIconProps {
  icon: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function LoanTypeIcon({ icon, className, size = "md" }: LoanTypeIconProps) {
  const IconComponent = ICON_MAP[icon];
  if (!IconComponent) return <FileText className={cn(SIZE_MAP[size], className)} />;
  return <IconComponent className={cn(SIZE_MAP[size], className)} />;
}
