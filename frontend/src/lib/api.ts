import { BorrowRequest, User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }
  return response.json();
}

export async function login(
  data: FormData
): Promise<{ access_token: string }> {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    body: data,
  });
  if (!response.ok) {
    throw new Error("Login failed");
  }
  return response.json();
}

export async function register(data: any): Promise<User> {
  const response = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Registration failed");
  }
  return response.json();
}

export async function getAllBorrowRequests(): Promise<BorrowRequest[]> {
  return fetchWithAuth(`${API_URL}/api/v1/borrow-requests`);
}

export async function updateBorrowRequestStatus(
  requestId: string,
  status: string
): Promise<BorrowRequest> {
  return fetchWithAuth(`${API_URL}/api/v1/borrow-requests/${requestId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function getMyBorrowRequests(): Promise<BorrowRequest[]> {
  return fetchWithAuth(`${API_URL}/api/v1/borrow-requests/my-requests`);
}

export async function getInventory(token: string) {
  return fetchWithAuth(`${API_URL}/api/v1/inventory`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createInventoryItem(item: any, token: string) {
  return fetchWithAuth(`${API_URL}/api/v1/inventory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
}

export async function updateInventoryItem(id: string, item: any, token: string) {
  return fetchWithAuth(`${API_URL}/api/v1/inventory/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
}

export async function deleteInventoryItem(id: string, token: string) {
  return fetchWithAuth(`${API_URL}/api/v1/inventory/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}