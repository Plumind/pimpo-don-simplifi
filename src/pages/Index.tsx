import { useState, useEffect } from "react";
import { Receipt as ReceiptType } from "@/types/Receipt";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import AddReceiptForm from "@/components/AddReceiptForm";
import ReceiptsList from "@/components/ReceiptsList";

const Index = () => {
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <Dashboard receipts={receipts} />
        
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <AddReceiptForm onAddReceipt={handleAddReceipt} />
          </div>
          
          <div>
            <ReceiptsList receipts={receipts} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;