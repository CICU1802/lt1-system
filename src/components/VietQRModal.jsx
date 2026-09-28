import React, { useState } from 'react';
import { X, Check, Copy, Download, Share2, ShieldCheck, CheckCircle2, Sparkles, Building2, User, CreditCard } from 'lucide-react';

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
  
  // Extract primary class code or name (e.g. TOAN10, TOAN12)
  let classIdentifier = 'LT1';
  if (invoice.classNames && invoice.classNames.length > 0) {
    const rawName = invoice.classNames[0];
    classIdentifier = rawName.split(' ')[0] || 'TOAN10';
  } else if (invoice.className) {
    classIdentifier = invoice.className.split(' ')[0] || 'TOAN10';
  }
  // Standardized memo according to requirement: LT1 [MãHS] [TênLớp]
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
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0B1120] border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden text-slate-100 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                SMART VIETQR TERMINAL
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold uppercase">EMVCo Chuẩn</span>
              </div>
              <div className="text-[11px] text-slate-400">Cổng thanh toán tự động học phí Trung tâm LT1</div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Natural Tone Toast Notification */}
        {toastMessage && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in slide-in-from-top-1">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="p-5 overflow-y-auto max-h-[80vh] space-y-4">
          {/* Student & Invoice Quick Pill */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Học sinh:</span>{' '}
              <strong className="text-slate-100">{invoice.studentName}</strong>{' '}
              <span className="text-slate-400 font-mono">({invoice.studentCode})</span>
            </div>
            <div className="font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
              {invoice.invoiceCode || 'HÓA ĐƠN'}
            </div>
          </div>

          {/* Smart QR Card */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
            <div className="text-[11px] tracking-wide text-slate-400 uppercase font-medium mb-3 flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-400" /> Quét mã bằng ứng dụng Ngân hàng hoặc MoMo
            </div>

            {/* QR Box with Live Indicator */}
            <div className="p-3 bg-white rounded-xl shadow-xl shadow-black/50 border border-slate-200 relative group">
              <img
                src={qrUrl}
                alt="VietQR Standard Transfer Code"
                className="w-52 h-52 object-contain block rounded"
                onError={(e) => {
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=208x208&data=${encodeURIComponent(`VietQR: MB-${accountNo} | ${amount} VND | ${transferContent}`)}`;
                }}
              />
            </div>

            {/* Amount Display */}
            <div className="mt-3 text-2xl font-black text-amber-400 tracking-tight">
              {amount.toLocaleString('vi-VN')} <span className="text-sm font-semibold text-slate-400">VNĐ</span>
            </div>

            {/* Dynamic Pulse Waiting Indicator */}
            <div className="mt-2 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Đang chờ hệ thống ngân hàng ghi nhận chuyển khoản...</span>
            </div>
          </div>

          {/* Beneficiary Details Breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Building2 size={13} className="text-slate-500" /> Ngân hàng thụ hưởng:
              </span>
              <strong className="text-slate-200">{bankName}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CreditCard size={13} className="text-slate-500" /> Số tài khoản:
              </span>
              <div className="flex items-center gap-2">
                <strong className="font-mono text-sm text-amber-400 font-bold">{accountNo}</strong>
                <button
                  type="button"
                  onClick={() => handleCopy(accountNo, 'acc', 'số tài khoản')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1"
                  title="Sao chép số tài khoản"
                >
                  {copiedField === 'acc' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span className="text-[10px]">Copy</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User size={13} className="text-slate-500" /> Chủ tài khoản:
              </span>
              <strong className="text-slate-200">{accountName}</strong>
            </div>

            {/* Standardized Transfer Memo */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[11px]">Nội dung chuyển khoản (Tự động):</span>
                <span className="text-[10px] text-slate-500">Chuẩn LT1 [MãHS] [TênLớp] để tự khớp học phí</span>
              </div>
              <div className="flex items-center gap-2">
                <strong className="font-mono text-sm text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {transferContent}
                </strong>
                <button
                  type="button"
                  onClick={() => handleCopy(transferContent, 'memo', 'nội dung chuyển khoản')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1"
                  title="Sao chép nội dung"
                >
                  {copiedField === 'memo' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span className="text-[10px]">Copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Đóng cửa sổ
          </button>

          <button
            type="button"
            onClick={handlePaymentSuccess}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Đang đồng bộ hóa đơn...</span>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Xác nhận đã thanh toán (Tiền mặt / Chuyển khoản)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
