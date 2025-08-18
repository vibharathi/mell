"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface RequestBorrowDialogProps {
  equipmentItemId: string;
  children: React.ReactNode;
}

export function RequestBorrowDialog({
  equipmentItemId,
  children,
}: RequestBorrowDialogProps) {
  const { token } = useAuth();
  const [requestDetails, setRequestDetails] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!token) return;

    try {
      await api.post(
        "/api/v1/borrow-requests",
        {
          equipment_item_id: equipmentItemId,
          request_details: requestDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOpen(false);
    } catch (error) {
      console.error("Failed to submit borrow request", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request to Borrow</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Enter any details for your request..."
            value={requestDetails}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setRequestDetails(e.target.value)
            }
          />
        </div>
        <Button onClick={handleSubmit}>Submit Request</Button>
      </DialogContent>
    </Dialog>
  );
}