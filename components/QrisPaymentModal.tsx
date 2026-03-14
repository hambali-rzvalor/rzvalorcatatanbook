'use client';

import { useState, useEffect } from 'react';
import { X, QrCode, Copy, Check, Loader2, RefreshCw } from 'lucide-react';

interface QrisPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description?: string;
  portions?: number;
  onSuccess?: (data: any) => void;
}

export default function QrisPaymentModal({
  isOpen,
  onClose,
  amount,
  description,
  portions,
  onSuccess,
}: QrisPaymentModalProps) {
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (isOpen && amount > 0) {
      createQrisPayment();
    }
  }, [isOpen, amount]);

  useEffect(() => {
    if (timeLeft > 0 && qrData) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && qrData) {
      // Payment expired
      setError('QRIS telah kadaluarsa. Silakan generate QR baru.');
    }
  }, [timeLeft, qrData]);

  useEffect(() => {
    if (orderId && qrData) {
      // Poll payment status every 3 seconds
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/qris?orderId=${orderId}`);
          const result = await response.json();
          
          if (result.success && result.data) {
            if (result.data.status === 'success') {
              // Payment successful
              clearInterval(pollInterval);
              onSuccess?.(result.data);
            }
          }
        } catch (err) {
          console.error('Error polling payment status:', err);
        }
      }, 3000);

      return () => clearInterval(pollInterval);
    }
  }, [orderId, qrData]);

  async function createQrisPayment() {
    setLoading(true);
    setError('');
    setQrData(null);
    setTimeLeft(900);

    try {
      const response = await fetch('/api/qris', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description: description || `Pembayaran QRIS Rp ${amount.toLocaleString('id-ID')}`,
          portions,
          transactionDate: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setQrData(result.data);
        setOrderId(result.data.orderId);
      } else {
        setError(result.message || 'Gagal membuat pembayaran QRIS');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat membuat pembayaran QRIS');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async function copyPaymentInfo() {
    const textToCopy = `Order ID: ${orderId}\nAmount: Rp ${amount.toLocaleString('id-ID')}`;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg shadow-green-200">
            <QrCode className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Pembayaran QRIS</h2>
          <p className="text-gray-500 text-sm mt-1">Scan QR code untuk membayar</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Membuat QR Code...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={createQrisPayment}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Generate QR Baru
            </button>
          </div>
        )}

        {/* QR Code Display */}
        {qrData && !error && !loading && (
          <>
            {/* Amount */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 mb-6">
              <p className="text-gray-600 text-sm text-center mb-1">Total Pembayaran</p>
              <p className="text-3xl font-bold text-green-600 text-center">
                Rp {amount.toLocaleString('id-ID')}
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 mb-6">
              {qrData.qrString ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData.qrString)}`}
                  alt="QRIS QR Code"
                  className="w-full h-auto"
                />
              ) : qrData.actions?.length > 0 ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-3">QR Code akan muncul di aplikasi e-wallet Anda</p>
                  <a
                    href={qrData.actions[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                  >
                    <QrCode className="w-5 h-5" />
                    Buka QRIS
                  </a>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">QR Code tidak tersedia</p>
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                timeLeft < 60 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-amber-100 text-amber-600'
              }`}>
                ⏱️ Berlaku hingga {formatTime(timeLeft)}
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order ID</p>
                  <p className="text-sm font-mono text-gray-700 truncate max-w-[200px]">
                    {orderId}
                  </p>
                </div>
                <button
                  onClick={copyPaymentInfo}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Salin info"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                💡 Buka aplikasi e-wallet Anda dan scan QR code
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
