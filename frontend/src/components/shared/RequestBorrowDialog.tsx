"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import "@/styles/datepicker.css";

interface RequestBorrowDialogProps {
  equipmentItemId: string;
  children: React.ReactNode;
}

export function RequestBorrowDialog({
  equipmentItemId,
  children,
}: RequestBorrowDialogProps) {
  const { token } = useAuth();
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerEmail, setBorrowerEmail] = useState("");
  const [borrowerPhone, setBorrowerPhone] = useState("");
  const [requestDetails, setRequestDetails] = useState("");
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) return "Email is invalid";
    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone) return "Phone number is required";
    if (!/^\d{10}$/.test(phone)) return "Phone number must be 10 digits";
    return "";
  };

  const handleSubmit = async () => {
    const emailError = validateEmail(borrowerEmail);
    const phoneError = validatePhone(borrowerPhone);

    if (emailError || phoneError) {
      setErrors({ email: emailError, phone: phoneError });
      return;
    }

    if (!token || !returnDate) return;

    try {
      await fetchWithAuth("http://127.0.0.1:8000/api/v1/borrow-requests", {
        method: "POST",
        body: JSON.stringify({
          equipment_item_id: equipmentItemId,
          borrower_name: borrowerName,
          borrower_email: borrowerEmail,
          borrower_phone: borrowerPhone,
          request_details: requestDetails,
          return_date: returnDate.toISOString(),
        }),
      });
      setMessage("Your request has been submitted successfully.");
      setMessageType("success");
    } catch (error) {
      console.error("Failed to submit borrow request", error);
      setMessage("Failed to submit borrow request. Please try again.");
      setMessageType("error");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMessage(null);
    setMessageType(null);
    setBorrowerName("");
    setBorrowerEmail("");
    setBorrowerPhone("");
    setRequestDetails("");
    setReturnDate(null);
    setErrors({ email: "", phone: "" });
  };

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 6);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        } else {
          setOpen(true);
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {message ? "Request Status" : "Request to Borrow"}
          </DialogTitle>
        </DialogHeader>
        {message ? (
          <div className="grid gap-4 py-4">
            <p
              className={
                messageType === "success" ? "text-green-600" : "text-red-600"
              }
            >
              {message}
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Your Name"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
              />
              <Input
                placeholder="Your Email"
                value={borrowerEmail}
                onChange={(e) => {
                  setBorrowerEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
              />
              {errors.email && <p className="text-red-600">{errors.email}</p>}
              <Input
                placeholder="Your Phone Number"
                value={borrowerPhone}
                onChange={(e) => {
                  setBorrowerPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
              />
              {errors.phone && <p className="text-red-600">{errors.phone}</p>}
              <Textarea
                placeholder="Enter any details for your request..."
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
              />
              <DatePicker
                selected={returnDate}
                onChange={(date) => setReturnDate(date)}
                minDate={today}
                maxDate={maxDate}
                placeholderText="Select a return date"
                className="w-full p-2 border rounded"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!returnDate || !borrowerName || !borrowerEmail || !borrowerPhone}
            >
              Submit Request
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}