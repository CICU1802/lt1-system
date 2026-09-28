import React, { useState } from 'react';
import { X, Check, Copy, Download, Share2, ShieldCheck, CheckCircle } from 'lucide-react';

export default function VietQRModal({ invoice, onClose, onConfirmPayment }) {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!invoice) return null;

  const bankId = 'MB'; // MB Bank
  const accountNo = '0918111222';
  const accountName = 'TRUNG TAM DAY THEM LT1';
  const amount = invoice.remainingAmount > 0 ? invoice.remainingAmount : invoice.finalAmount;
  const transferContent = `LT1 ${invoice.studentCode} ${invoice.invoiceCode}`;

  // VietQR quick URL generator
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--brand-blue)" />
            <span>Mã QR Thanh Toán Học Phí</span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Học sinh: <strong>{invoice.studentName}</strong> ({invoice.studentCode})
          </div>

          {/* VietQR Display Box */}
          <div className="vietqr-card">
            <div style={{ fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8 }}>
              Quét mã bằng ứng dụng ngân hàng hoặc MoMo
            </div>

            <div className="vietqr-img-box">
              <img
                src={qrUrl}
                alt="VietQR Payment Code"
                style={{ width: '240px', height: 'auto', display: 'block', borderRadius: '4px' }}
                onError={(e) => {
                  // Fallback if network offline
                  e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=' + encodeURIComponent(`VietQR: ${accountNo} | ${amount}VND | ${transferContent}`);
                }}
              />
            </div>

            <div style={{ fontSize: '24px', fontWeight: '800', color: '#60a5fa' }}>
              {amount.toLocaleString('vi-VN')} đ
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
              Mã hóa đơn: {invoice.invoiceCode}
            </div>
          </div>

          {/* Bank Transfer Details Form */}
          <div style={{ marginTop: '20px', textAlign: 'left', background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ngân hàng thụ hưởng:</span>
              <strong>MB Bank (Ngân hàng Quân Đội)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Số tài khoản:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ color: 'var(--brand-blue)' }}>{accountNo}</strong>
                <button className="btn-icon" style={{ padding: '2px 6px', height: 'auto' }} onClick={() => handleCopy(accountNo)}>
                  <Copy size={12} />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Chủ tài khoản:</span>
              <strong>{accountName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Nội dung chuyển khoản:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ color: 'var(--color-danger)' }}>{transferContent}</strong>
                <button className="btn-icon" style={{ padding: '2px 6px', height: 'auto' }} onClick={() => handleCopy(transferContent)}>
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>

          {copied && (
            <div style={{ fontSize: '12px', color: 'var(--color-success)', marginTop: '8px', fontWeight: '600' }}>
              ✓ Đã sao chép vào bộ nhớ tạm!
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
          <button
            className="btn btn-success"
            onClick={handlePaymentSuccess}
            disabled={isProcessing}
          >
            <CheckCircle size={16} />
            {isProcessing ? 'Đang cập nhật...' : 'Xác Nhận Đã Thu Tiền'}
          </button>
        </div>
      </div>
    </div>
  );
}
