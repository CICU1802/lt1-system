import React, { useState } from 'react';
import { X, Check, Copy, ShieldCheck, CheckCircle2, Building2, User, CreditCard, Sparkles } from 'lucide-react';

export default function VietQRModal({ invoice, onClose, onConfirmPayment }) {
  const [copiedField, setCopiedField] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  if (!invoice) return null;

  const bankId = 'MB'; // MB Bank
  const bankName = 'MB Bank (Ngân hàng Quân Đội)';
  const accountNo = '0918111222';
  const accountName = 'TRUNG TAM DAY THEM LT1';
  const amount = invoice.remainingAmount > 0 ? invoice.remainingAmount : (invoice.finalAmount || 1200000);
  
  let classIdentifier = 'TOAN10';
  if (invoice.classNames && invoice.classNames.length > 0) {
    const rawName = invoice.classNames[0];
    classIdentifier = rawName.split(' ')[0] || 'TOAN10';
  } else if (invoice.className) {
    classIdentifier = invoice.className.split(' ')[0] || 'TOAN10';
  }
  
  const cleanStudentCode = (invoice.studentCode || 'HS24-001').replace('-', '');
  const transferContent = `LT1 ${cleanStudentCode} ${classIdentifier.toUpperCase()}`.replace(/\s+/g, ' ');

  // VietQR standard EMVCo dynamic image URL
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;

  const handleCopy = (text, fieldName, fieldLabel) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Đã sao chép ${fieldLabel}: "${text}"`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handlePaymentSuccess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmPayment(invoice.id);
      setIsProcessing(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-transparent.png" alt="LT1 Education" className="h-9 w-auto object-contain" />
            <div>
              <div className="text-sm font-bold text-[#182C5A] flex items-center gap-1.5">
                <span>LT1 EDUCATION</span>
                <span className="text-[10px] font-semibold text-[#3B5998] px-1.5 py-0.2 rounded bg-blue-50 border border-blue-100 uppercase">VietQR</span>
              </div>
              <div className="text-[11px] text-slate-500">Cổng thanh toán học phí chính thức • Learn to be the best</div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Student Info Pill */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Học sinh:</span>{' '}
              <strong className="text-slate-800">{invoice.studentName}</strong>{' '}
              <span className="text-slate-400 font-mono">({invoice.studentCode})</span>
            </div>
            <span className="font-mono text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200">
              {invoice.invoiceCode || 'HÓA ĐƠN'}
            </span>
          </div>

          {/* QR Code Container */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
            <div className="text-[11px] text-slate-500 mb-2.5">
              Quét mã bằng ứng dụng Ngân hàng hoặc MoMo
            </div>

            <div className="p-3 bg-white rounded-2xl shadow-xs border border-slate-200">
              <img
                src={qrUrl}
                alt="VietQR Payment"
                className="w-48 h-48 object-contain block rounded-lg"
                onError={(e) => {
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(`VietQR: MB-${accountNo} | ${amount} VND | ${transferContent}`)}`;
                }}
              />
            </div>

            <div className="mt-3 text-xl font-bold text-slate-900 tabular-nums">
              {amount.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">VNĐ</span>
            </div>

            <div className="mt-2 flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-600 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Đang chờ hệ thống ngân hàng ghi nhận...</span>
            </div>
          </div>

          {/* Beneficiary Details Breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
              <strong className="text-slate-800">{bankName}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số tài khoản:</span>
              <div className="flex items-center gap-2">
                <strong className="font-mono text-slate-900 font-semibold">{accountNo}</strong>
                <button
                  type="button"
                  onClick={() => handleCopy(accountNo, 'acc', 'số tài khoản')}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'acc' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Chủ tài khoản:</span>
              <strong className="text-slate-800">{accountName}</strong>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[11px] block">Nội dung chuyển khoản:</span>
                <span className="text-[10px] text-slate-400">Chuẩn LT1 [MãHS] [TênLớp] để tự khớp</span>
              </div>
              <div className="flex items-center gap-2">
                <strong className="font-mono text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {transferContent}
                </strong>
                <button
                  type="button"
                  onClick={() => handleCopy(transferContent, 'memo', 'nội dung chuyển khoản')}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'memo' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handlePaymentSuccess}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Đang đồng bộ...</span>
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>Xác nhận đã thanh toán (Tiền mặt / Chuyển khoản)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
