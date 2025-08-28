import { useState, useEffect } from "react";
import { Receipt as ReceiptType } from "@/types/Receipt";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import AddReceiptForm from "@/components/AddReceiptForm";
import ReceiptsList from "@/components/ReceiptsList";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);
  const [editingReceipt, setEditingReceipt] = useState<ReceiptType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");

  // Load receipts from localStorage on component mount
  useEffect(() => {
    const storedReceipts = localStorage.getItem('pimpo-receipts');
    if (storedReceipts) {
      try {
        setReceipts(JSON.parse(storedReceipts));
      } catch (error) {
        console.error('Error loading receipts from localStorage:', error);
      }
    } else {
      // Add some sample data for demonstration
      const sampleReceipts: ReceiptType[] = [
        {
          id: "1",
          date: "2024-12-15",
          organism: "Médecins Sans Frontières",
          amount: 150,
          createdAt: new Date().toISOString()
        },
        {
          id: "2", 
          date: "2024-11-20",
          organism: "Restos du Cœur",
          amount: 75,
          createdAt: new Date().toISOString()
        },
        {
          id: "3",
          date: "2024-10-05",
          organism: "Croix-Rouge Française", 
          amount: 200,
          createdAt: new Date().toISOString()
        }
      ];
      setReceipts(sampleReceipts);
    }
  }, []);

  // Save receipts to localStorage whenever receipts change
  useEffect(() => {
    localStorage.setItem('pimpo-receipts', JSON.stringify(receipts));
  }, [receipts]);

  const handleAddReceipt = (newReceipt: ReceiptType) => {
    setReceipts(prev => [...prev, newReceipt]);
  };

  const handleUpdateReceipt = (updated: ReceiptType) => {
    setReceipts(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    setEditingReceipt(null);
  };

  const handleDeleteReceipt = (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateReceiptPhoto = (id: string, photo: string | null) => {
    setReceipts(prev => prev.map(r => (r.id === id ? { ...r, photo: photo || undefined } : r)));
  };

  const years = Array.from(new Set(receipts.map(r => r.date.slice(0, 4)))).sort().reverse();

  const filteredReceipts = receipts.filter((r) => {
    const matchesYear = selectedYear === "all" || r.date.startsWith(selectedYear);
    const matchesSearch = r.organism.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesYear && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
        <main className="container mx-auto px-4 py-8 space-y-8">
          <Dashboard receipts={filteredReceipts} selectedYear={selectedYear} />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Input
              placeholder="Rechercher un organisme"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <AddReceiptForm
                onAddReceipt={handleAddReceipt}
                initialData={editingReceipt || undefined}
                onUpdateReceipt={handleUpdateReceipt}
                onCancelEdit={() => setEditingReceipt(null)}
              />
            </div>

            <div>
              <ReceiptsList
                receipts={filteredReceipts}
                onDeleteReceipt={handleDeleteReceipt}
                onEditReceipt={(receipt) => setEditingReceipt(receipt)}
                onUpdatePhoto={handleUpdateReceiptPhoto}
              />
            </div>
          </div>
        </main>
      </div>
    );
  };

export default Index;