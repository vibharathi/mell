"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { EquipmentItem } from "@/types";

export default function EquipmentCatalog() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await api.get("/api/v1/inventory", {
          params: {
            name: searchTerm,
            category,
            status,
          },
        });
        setEquipment(response.data);
      } catch (error) {
        console.error("Failed to fetch equipment", error);
      }
    };

    fetchEquipment();
  }, [searchTerm, category, status]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Equipment Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Input
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          onValueChange={(value) => setCategory(value === "all" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Mobility Equipment">Mobility Equipment</SelectItem>
            <SelectItem value="Bedroom Aids">Bedroom Aids</SelectItem>
            <SelectItem value="Bathroom Aids">Bathroom Aids</SelectItem>
            <SelectItem value="Support Equipment">Support Equipment</SelectItem>
            <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {equipment.map((item) => (
          <Card key={item.id}>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}