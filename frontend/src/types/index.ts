export enum EquipmentCategory {
  MOBILITY_EQUIPMENT = "Mobility Equipment",
  BEDROOM_AIDS = "Bedroom Aids",
  BATHROOM_AIDS = "Bathroom Aids",
  SUPPORT_EQUIPMENT = "Support Equipment",
  MISCELLANEOUS = "Miscellaneous",
}

export interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  category: EquipmentCategory;
  condition: string;
  image_url?: string;
  status: "Available" | "Unavailable";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Borrower" | "Admin";
  createdAt: string;
  updatedAt: string;
}

export interface BorrowRequest {
  id: string;
  equipment_item_id: string;
  borrower_id: string;
  borrower_name: string;
  borrower_email: string;
  request_date: string;
  return_date: string;
  status: "Pending" | "Approved" | "Denied" | "Checked Out" | "Returned" | "Cancelled";
}