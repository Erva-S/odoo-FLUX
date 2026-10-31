import React from "react";
import clsx from "clsx";

export type BadgeStatusType =
  | "active"
  | "paid"
  | "confirmed"
  | "quotation"
  | "draft"
  | "due_soon"
  | "paused"
  | "overdue"
  | "cancelled"
  | "closed"
  | "admin"
  | "staff"
  | "customer";

interface NeoBadgeProps {
  status: BadgeStatusType | string;
  label?: string;
  className?: string;
}

export const NeoBadge: React.FC<NeoBadgeProps> = ({ status, label, className }) => {
  const normalized = status.toLowerCase().replace(/[\s-]/g, "_");

  let styles = "bg-neoCanvas text-neoBlack border-2 border-black border-dashed";
  let displayLabel = label || status;

  switch (normalized) {
    case "active":
    case "paid":
      styles = "bg-statusGreen text-neoBlack border-2 border-black";
      displayLabel = label || (normalized === "active" ? "Active" : "Paid");
      break;
    case "confirmed":
    case "quotation":
      styles = "bg-neoSage text-neoBlack border-2 border-black";
      displayLabel = label || (normalized === "confirmed" ? "Confirmed" : "Quotation");
      break;
    case "draft":
      styles = "bg-neoCanvas text-neoBlack border-2 border-black border-dashed";
      displayLabel = label || "Draft";
      break;
    case "due_soon":
      styles = "bg-statusAmber text-neoBlack border-2 border-black";
      displayLabel = label || "Due Soon";
      break;
    case "paused":
      styles = "bg-statusAmber text-neoBlack border-2 border-black";
      displayLabel = label || "Paused";
      break;
    case "overdue":
      styles = "bg-statusRed text-neoBlack border-2 border-black";
      displayLabel = label || "Overdue";
      break;
    case "cancelled":
      styles = "bg-statusRed text-neoBlack border-2 border-black";
      displayLabel = label || "Cancelled";
      break;
    case "closed":
      styles = "bg-neoDark text-neoWhite border-2 border-black";
      displayLabel = label || "Closed";
      break;
    case "admin":
      styles = "bg-neoSage text-neoBlack border-2 border-black";
      displayLabel = label || "Admin";
      break;
    case "staff":
      styles = "bg-neoYellow text-neoBlack border-2 border-black shadow-[2px_2px_0_0_#000]";
      displayLabel = label || "Staff";
      break;
    case "customer":
      styles = "bg-neoDark text-neoWhite border-2 border-black";
      displayLabel = label || "Customer";
      break;
    default:
      styles = "bg-neoCanvas text-neoBlack border-2 border-black";
      break;
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full select-none",
        styles,
        className
      )}
    >
      {displayLabel}
    </span>
  );
};

