export interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  category: string;
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