"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Info } from "lucide-react";
import BottomNav from "@/components/bottom-nav";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import AddTransaction from "@/components/add-transaction";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: "income" | "expense";
  status: "pending" | "approved" | "rejected";
  created_at: string;
  user_name: string;
  user_full_name: string;
}

export default function DashboardPage() {
  const { user, loading, refreshUser, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // Transaction detail dialog
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // First, check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshUser();
        setAuthChecked(true);
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [refreshUser]);

  // Perbaiki redirect logic
  useEffect(() => {
    if (authChecked && !loading && !isAuthenticated) {
      console.log(
        "Dashboard - User is not authenticated, redirecting to login"
      );
      router.push("/login");
    }
  }, [authChecked, loading, isAuthenticated, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch transactions with user information
        const { data: transactionsData, error: transactionsError } =
          await supabase
            .from("transactions_with_user_names")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5);

        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData || []);

        // Fetch balance
        const { data: balanceData, error: balanceError } = await supabase.rpc(
          "get_total_balance"
        );
        if (balanceError) throw balanceError;
        setBalance(balanceData || 0);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to fetch dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    } else if (authChecked && !loading) {
      setIsLoading(false);
    }
  }, [user, authChecked, loading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const showTransactionDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailOpen(true);
  };

  // Show loading state while checking auth
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#121212]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Memuat...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after checking, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#121212]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 dark:bg-[#121212]">
      <header className="p-4 flex items-center justify-between">
        <Image
          src="/logo.svg"
          alt="KasIn Logo"
          width={100}
          height={40}
          className="h-8 w-auto"
        />
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
      </header>

      <main className="p-4 space-y-4">
        <Card className="p-4 bg-[#00B894]/20 backdrop-blur-sm border-0 dark:bg-[#00B894]/10">
          <h2 className="text-white/70 mb-2">Saldo Saat Ini</h2>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(balance)}
          </p>
        </Card>

        <h2 className="text-xl font-bold text-white mt-6 mb-2">
          Transaksi Terbaru
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Card
                key={transaction.id}
                className={`p-3 border-0 ${
                  transaction.type === "income"
                    ? "bg-green-500/10 dark:bg-green-500/5"
                    : "bg-red-500/10 dark:bg-red-500/5"
                }`}
                onClick={() => showTransactionDetail(transaction)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-white">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-white/70">
                      {new Date(transaction.created_at).toLocaleDateString(
                        "id-ID"
                      )}
                    </p>
                    <p className="text-xs text-white/70 flex items-center mt-1">
                      <Info className="h-3 w-3 mr-1" />
                      Oleh: {transaction.user_full_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        transaction.type === "income"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === "approved"
                          ? "bg-green-500/20 text-green-300"
                          : transaction.status === "rejected"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {transaction.status === "approved"
                        ? "Disetujui"
                        : transaction.status === "rejected"
                        ? "Ditolak"
                        : "Menunggu"}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-4 bg-card/10 backdrop-blur-sm border-0 dark:bg-gray-800/50">
            <p className="text-center text-white/70 py-4">
              Belum ada transaksi
            </p>
          </Card>
        )}
      </main>

      {/* Transaction Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-[#1B2B44] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {selectedTransaction.type === "income"
                    ? "Pemasukan"
                    : "Pengeluaran"}
                </h3>
                <p
                  className={`font-bold text-lg ${
                    selectedTransaction.type === "income"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {selectedTransaction.type === "income" ? "+" : "-"}
                  {formatCurrency(selectedTransaction.amount)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-white/70">Deskripsi</p>
                  <p className="text-white font-medium">
                    {selectedTransaction.description}
                  </p>
                </div>

                <div className="flex justify-between">
                  <p className="text-white/70">Status</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedTransaction.status === "approved"
                        ? "bg-green-500/20 text-green-300"
                        : selectedTransaction.status === "rejected"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {selectedTransaction.status === "approved"
                      ? "Disetujui"
                      : selectedTransaction.status === "rejected"
                      ? "Ditolak"
                      : "Menunggu"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <p className="text-white/70">Dibuat oleh</p>
                  <p className="text-white">
                    {selectedTransaction.user_full_name}
                  </p>
                </div>

                <div className="flex justify-between">
                  <p className="text-white/70">Username</p>
                  <p className="text-white">{selectedTransaction.user_name}</p>
                </div>

                <div className="flex justify-between">
                  <p className="text-white/70">Tanggal</p>
                  <p className="text-white">
                    {formatDate(selectedTransaction.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => setIsDetailOpen(false)}
              className="bg-accent hover:bg-accent/90 text-white"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddTransaction />
      <BottomNav />
    </div>
  );
}
