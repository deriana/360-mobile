import { Payment } from '../types';
import { witnesses } from './witnesses';
import { CURRENT_WITNESS_ID } from '../utils/scope';

const AMOUNT = 350000;

const BANKS = ['Transfer Bank BCA', 'Transfer Bank Mandiri', 'Transfer Bank BRI', 'Transfer Bank BNI'];

const INVOICE_ITEMS = [
  { label: 'Honor Dasar Saksi TPS', amount: 300000 },
  { label: 'Uang Transport Lapangan', amount: 50000 },
  { label: 'Uang Makan', amount: 25000 },
  { label: 'Potongan Pajak PPh21 (Final)', amount: -25000 },
];

export const payments: Payment[] = witnesses.map((w, i) => {
  // ponytail: force the demo login's own witness to always be paid, since
  // TPS_WITNESS only ever views CURRENT_WITNESS_ID — otherwise the invoice
  // feature would be untestable whenever that index lands on "pending".
  const isPaid = w.id === CURRENT_WITNESS_ID ? true : i % 3 !== 0;
  return {
    witnessId: w.id,
    amount: AMOUNT,
    status: isPaid ? 'paid' : 'pending',
    proofRef: isPaid ? `PROOF-${w.id}` : null,
    paidAt: isPaid ? '2026-08-08 14:32' : null,
    method: isPaid ? BANKS[i % BANKS.length] : null,
    accountMasked: isPaid ? `•••• ${1000 + ((i * 137) % 9000)}` : null,
    invoiceItems: isPaid ? INVOICE_ITEMS : undefined,
  };
});
