

export const rupee = (n) =>
'₹' + Number(n ?? 0).toLocaleString('en-IN');

export const STATUS_LABEL = {
  PENDING_PAYMENT: 'Awaiting payment',
  PAYMENT_UPLOADED: 'Needs verification',
  PAYMENT_VERIFICATION: 'Verifying',
  PAYMENT_APPROVED: 'Payment approved',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  AT_HUB: 'At Delivery Hub',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

// Maps an order status to a badge tone class (defined in globals.css).
export const STATUS_TONE = {
  PENDING_PAYMENT: 'muted',
  PAYMENT_UPLOADED: 'ember',
  PAYMENT_VERIFICATION: 'ember',
  PAYMENT_APPROVED: 'green',
  PROCESSING: 'gold',
  PACKED: 'gold',
  SHIPPED: 'gold',
  AT_HUB: 'gold',
  OUT_FOR_DELIVERY: 'gold',
  DELIVERED: 'green',
  CANCELLED: 'muted'
};

// Next fulfilment step for the "advance" action.
export const FULFILMENT_NEXT = {
  PAYMENT_APPROVED: 'PROCESSING',
  PROCESSING: 'PACKED',
  PACKED: 'SHIPPED',
  SHIPPED: 'AT_HUB',
  AT_HUB: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED'
};

export const ORDER_FLOW = [
'PENDING_PAYMENT',
'PAYMENT_UPLOADED',
'PAYMENT_APPROVED',
'PROCESSING',
'PACKED',
'SHIPPED',
'AT_HUB',
'OUT_FOR_DELIVERY',
'DELIVERED'];