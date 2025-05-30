
export interface RazorpayPaymentCapturedWebhook {
  entity: string;
  account_id: string;
  event: "payment.captured";
  contains: ["payment"];
  payload: {
    payment: {
      entity: {
        id: string;
        entity: "payment";
        amount: number;
        currency: string; //INR
        status: "captured";
        order_id: string;
        invoice_id: string | null;
        international: boolean;
        method: string;
        amount_refunded: number;
        refund_status: string | null;
        captured: boolean;
        description: string;
        card_id: string | null;
        bank: string;
        wallet: string | null;
        vpa: string | null;
        email: string;
        contact: string;
        notes: [] | unknown;
        fee: number;
        tax: number;
        error_code: string | null;
        error_description: string | null;
        error_source: string | null;
        error_step: string | null;
        error_reason: string | null;
        acquirer_data: Record<string, any>;
        created_at: number;
        reward: null | unknown;
        base_amount: number;
      };
    };
  };
  created_at: number;
}
