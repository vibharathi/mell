"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/api";
import { EquipmentItem, EquipmentCategory } from "@/types";

export default function AdminInventoryPage() {
  const { token } = useAuth();
  const [inventory, setInventory] = useState<EquipmentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const createFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const fetchInventory = useCallback(async () => {
    if (token) {
      try {
        const data = await getInventory(token);
        setInventory(data);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      }
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchInventory();
    }
  }, [token, fetchInventory]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (token) {
      const formData = new FormData(createFormRef.current!);
      const newItem = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as EquipmentCategory,
        condition: formData.get("condition") as string,
        status: "Available" as "Available" | "Unavailable",
      };
      try {
        await createInventoryItem(newItem, token);
        fetchInventory();
        setCreateDialogOpen(false);
      } catch (error) {
        console.error("Failed to create item:", error);
      }
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (token && selectedItem) {
      const formData = new FormData(editFormRef.current!);
      const updatedItem = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as EquipmentCategory,
        condition: formData.get("condition") as string,
        status: selectedItem.status,
      };
      try {
        await updateInventoryItem(selectedItem.id, updatedItem, token);
        fetchInventory();
        setEditDialogOpen(false);
        setSelectedItem(null);
      } catch (error) {
        console.error("Failed to update item:", error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (token) {
      try {
        await deleteInventoryItem(id, token);
        fetchInventory();
      } catch (error) {
        console.error("Failed to delete item:", error);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <div className="flex gap-2">
            <Link href="/admin">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create New Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Inventory Item</DialogTitle>
              </DialogHeader>
              <form ref={createFormRef} onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" required />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(EquipmentCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <Input id="condition" name="condition" required />
                </div>
                <Button type="submit">Create</Button>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.condition}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>
                  <Dialog open={isEditDialogOpen && selectedItem?.id === item.id} onOpenChange={(isOpen: boolean) => {
                    if (!isOpen) {
                      setSelectedItem(null);
                    }
                    setEditDialogOpen(isOpen);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedItem(item);
                        setEditDialogOpen(true);
                      }}>
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Inventory Item</DialogTitle>
                      </DialogHeader>
                      <form ref={editFormRef} onSubmit={handleUpdate} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" name="name" defaultValue={selectedItem?.name} required />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Input id="description" name="description" defaultValue={selectedItem?.description} required />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input id="category" name="category" defaultValue={selectedItem?.category} required />
                        </div>
                        <div>
                          <Label htmlFor="condition">Condition</Label>
                          <Input id="condition" name="condition" defaultValue={selectedItem?.condition} required />
                        </div>
                        <Button type="submit">Save Changes</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="ml-2">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the item.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  );
}