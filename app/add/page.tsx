'use client';

import { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, PlusCircle, Tag, Hash, Calendar, Save, QrCode } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import QrisPaymentModal from '@/components/QrisPaymentModal';
import { addTransaction } from '@/app/actions';
import { useRouter, useSearchParams } from 'next/navigation';

type TransactionType = 'income' | 'expense';

const categories = {
  income: [
    { value: 'penjualan', label: 'Penjualan' },
    { value: 'lain_lain', label: 'Lain-lain' },
  ],
  expense: [
    { value: 'bahan_baku', label: 'Bahan Baku' },
    { value: 'operasional', label: 'Operasional' },
    { value: 'listrik_air', label: 'Listrik/Air' },
    { value: 'lain_lain', label: 'Lain-lain' },
  ],
};

function AddTransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactionType, setTransactionType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [portions, setPortions] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // QRIS Payment state
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [qrisPaid, setQrisPaid] = useState(false);

  // Set transaction type based on URL query parameter
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'expense') {
      setTransactionType('expense');
      setCategory('bahan_baku');
    } else if (type === 'income') {
      setTransactionType('income');
      setCategory('penjualan');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use current time for transaction
      const now = new Date();
      const transactionDateTime = new Date(`${transactionDate}T${now.toTimeString().slice(0, 8)}`);

      const result = await addTransaction({
        type: transactionType,
        category: category as any,
        description: description || `${transactionType === 'income' ? 'Penjualan' : 'Pengeluaran'} ${category}`,
        amount: parseInt(amount) || 0,
        portions: transactionType === 'income' ? (parseInt(portions) || 0) : 0,
        transactionDate: transactionDateTime,
      });

      if (result.success) {
        alert('✅ ' + result.message);
        // Reset form
        setAmount('');
        setDescription('');
        setCategory('');
        setPortions('');
        // Redirect based on type
        if (transactionType === 'expense') {
          router.push('/expenses');
        } else {
          router.push('/sales');
        }
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
      alert('❌ Terjadi kesalahan saat menambahkan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Transaction Type Toggle */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setTransactionType('income');
              setCategory('penjualan');
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              transactionType === 'income'
                ? 'bg-linear-to-br from-green-500 to-green-600 text-white shadow-md shadow-green-200'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => {
              setTransactionType('expense');
              setCategory('bahan_baku');
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              transactionType === 'expense'
                ? 'bg-linear-to-br from-red-500 to-red-600 text-white shadow-md shadow-red-200'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Tag className="w-5 h-5" />
            Pengeluaran
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount Input */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Jumlah Uang
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">
            Rp
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Category Select */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kategori
        </label>
        <div className="relative">
          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
            required
          >
            <option value="">Pilih kategori</option>
            {categories[transactionType].map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Portions Input (only for income) */}
      {transactionType === 'income' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jumlah Porsi
          </label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={portions}
              onChange={(e) => setPortions(e.target.value)}
              placeholder="0"
              className="w-full pl-12 pr-4 py-3.5 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Description Input */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Keterangan <span className="text-gray-400 font-normal">(opsional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tambahkan catatan"
          rows={3}
          className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Date Input */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tanggal
        </label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          ⏱️ Waktu otomatis menggunakan waktu saat ini
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          transactionType === 'income'
            ? 'bg-linear-to-br from-green-500 to-green-600 shadow-green-200 hover:shadow-xl hover:shadow-green-300'
            : 'bg-linear-to-br from-red-500 to-red-600 shadow-red-200 hover:shadow-xl hover:shadow-red-300'
        }`}
      >
        <Save className="w-6 h-6" />
        {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
      </button>

      {/* QRIS Payment Button (only for income) */}
      {transactionType === 'income' && amount && parseInt(amount) > 0 && (
        <button
          type="button"
          onClick={() => setShowQrisModal(true)}
          disabled={qrisPaid}
          className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg bg-linear-to-br from-blue-500 to-cyan-600 shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <QrCode className="w-6 h-6" />
          {qrisPaid ? '✅ Pembayaran QRIS Berhasil' : 'Bayar dengan QRIS'}
        </button>
      )}

      {/* QRIS Payment Modal */}
      {showQrisModal && (
        <QrisPaymentModal
          isOpen={showQrisModal}
          onClose={() => setShowQrisModal(false)}
          amount={parseInt(amount)}
          description={description || `Penjualan ${portions ? portions + ' porsi ' : ''}Tahu Walik`}
          portions={portions ? parseInt(portions) : 0}
          onSuccess={(data) => {
            setQrisPaid(true);
            alert('✅ Pembayaran QRIS berhasil! Transaksi akan otomatis tercatat.');
            setShowQrisModal(false);
            // Optionally auto-submit the transaction
            setTimeout(() => {
              router.push('/sales');
            }, 1500);
          }}
        />
      )}
    </form>
    </>
  );
}

export default function AddTransactionPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Handle scroll for header shadow effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex h-screen bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <div className={`sticky top-0 z-50 bg-linear-to-br from-gray-50 to-gray-100/95 backdrop-blur-sm transition-shadow duration-300 ${
          isScrolled ? 'shadow-lg shadow-gray-200/50' : ''
        }`}>
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {/* Header Section */}
          <div className="mb-6">
            <a href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Kembali</span>
            </a>
          </div>

          <Suspense fallback={<div className="text-center py-12">Memuat form...</div>}>
            <AddTransactionForm />
          </Suspense>
        </main>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
