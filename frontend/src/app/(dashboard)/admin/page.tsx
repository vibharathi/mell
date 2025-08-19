"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllBorrowRequests, updateBorrowRequestStatus } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { BorrowRequest } from "@/types";

export default function AdminDashboard() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [filter, setFilter] = useState("Pending");
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "Admin") {
      fetchRequests();
    }
  }, [user, filter]);

  const fetchRequests = async () => {
    try {
      const allRequests = await getAllBorrowRequests();
      const filtered = allRequests.filter((req) => req.status === filter);
      setRequests(filtered);
    } catch (error) {
      console.error("Failed to fetch borrow requests", error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateBorrowRequestStatus(id, status);
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Failed to update request status", error);
    }
  };

  if (user?.role !== "Admin") {
    return <p>You are not authorized to view this page.</p>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard: Borrow Requests</h1>
        <Link href="/admin/inventory">
          <Button>Manage Inventory</Button>
        </Link>
      </div>
      <div className="flex space-x-2 mb-4">
        {["Pending", "Approved", "Denied", "Checked Out", "Returned", "Cancelled"].map(
          (status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
            >
              {status}
            </Button>
          )
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Borrower</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Equipment ID</TableHead>
            <TableHead>Return Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.borrower_name}</TableCell>
              <TableCell>{request.borrower_email}</TableCell>
              <TableCell>{request.equipment_item_id}</TableCell>
              <TableCell>
                {new Date(request.return_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge>{request.status}</Badge>
              </TableCell>
              <TableCell>
                {request.status === "Pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(request.id, "Approved")}
                      className="mr-2"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStatusChange(request.id, "Denied")}
                    >
                      Deny
                    </Button>
                  </>
                )}
                {request.status === "Approved" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(request.id, "Checked Out")}
                  >
                    Check Out
                  </Button>
                )}
                {request.status === "Checked Out" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(request.id, "Returned")}
                  >
                    Mark as Returned
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}