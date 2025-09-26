export type PaymentMethod = 'Cash' | 'Card' | 'UPI' | 'Cheque';

export interface Receipt {
  id: string;
  receiptNumber: string;
  donorName: string;
  amount: number;
  date: string; // ISO string
  paymentMethod: PaymentMethod;
  remarks?: string;
  createdBy?: string; // user id
  customFields?: Record<string, any>;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  qrCodeData?: string;
} 