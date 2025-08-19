"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { AuthContext } from "@/contexts/AuthContext";
import { getMyBorrowRequests, updateBorrowRequestStatus } from "@/lib/api";
import { BorrowRequest } from "@/types";
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

export default function DashboardPage() {
  const authContext = useContext(AuthContext);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);

  useEffect(() => {
    if (authContext?.user) {
      fetchRequests();
    }
  }, [authContext?.user]);

  const fetchRequests = async () => {
    try {
      const myRequests = await getMyBorrowRequests();
      setRequests(myRequests);
    } catch (error) {
      console.error("Failed to fetch borrow requests", error);
    }
  };

  const handleCancelRequest = async (id: string) => {
    try {
      await updateBorrowRequestStatus(id, "Cancelled");
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Failed to cancel request", error);
    }
  };

  if (!authContext) {
    return <div>Loading...</div>;
  }

  const { user, loading } = authContext;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view the dashboard.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <Link href="/equipment">
          <Button>View Equipment</Button>
        </Link>
      </div>
      <h2 className="text-2xl font-semibold mb-4">My Borrow Requests</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipment ID</TableHead>
            <TableHead>Return Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.equipment_item_id}</TableCell>
              <TableCell>
                {new Date(request.return_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge>{request.status}</Badge>
              </TableCell>
              <TableCell>
                {request.status === "Pending" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleCancelRequest(request.id)}
                  >
                    Cancel Request
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