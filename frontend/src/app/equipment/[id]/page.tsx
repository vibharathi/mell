"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchWithAuth, API_URL } from "@/lib/api";
import { EquipmentItem } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { RequestBorrowDialog } from "@/components/shared/RequestBorrowDialog";

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [item, setItem] = useState<EquipmentItem | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await fetchWithAuth(`${API_URL}/api/v1/inventory/${id}`);
        setItem(data);
      } catch (error) {
        console.error("Failed to fetch equipment item", error);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  const handleRequestBorrow = () => {
    if (!user) {
      router.push("/login");
    } else {
      // Open request dialog
      console.log("Requesting to borrow item:", item?.id);
    }
  };

  if (!item) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{item.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{item.description}</p>
          <p className="mt-4">
            <strong>Category:</strong> {item.category}
          </p>
          <p>
            <strong>Status:</strong> {item.status}
          </p>
          <RequestBorrowDialog equipmentItemId={item.id}>
            <Button className="mt-4" disabled={item.status !== "Available"}>
              Request to Borrow
            </Button>
          </RequestBorrowDialog>
        </CardContent>
      </Card>
    </div>
  );
}
