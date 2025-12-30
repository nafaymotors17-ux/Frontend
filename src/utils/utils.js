import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getStoragePeriodColor(gateInDate, gateOutDate) {
  if (!gateInDate) return "text-gray-500";

  const inDate = new Date(gateInDate);
  const outDate = gateOutDate ? new Date(gateOutDate) : new Date();

  inDate.setHours(0, 0, 0, 0);
  outDate.setHours(0, 0, 0, 0);

  if (outDate < inDate) return "text-gray-500";

  const diffTime = outDate - inDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays <= 7) return "text-green-600";
  if (diffDays <= 30) return "text-yellow-600";
  return "text-red-600";
}
