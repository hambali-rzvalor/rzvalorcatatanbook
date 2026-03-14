declare module 'midtrans-client' {
  interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  interface ItemDetails {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }

  interface Callbacks {
    finish: string;
    error?: string;
    pending?: string;
  }

  interface QrCodeOptions {
    is_reusable: boolean;
  }

  interface TransactionParameter {
    transaction_details: TransactionDetails;
    item_details?: ItemDetails[];
    callbacks?: Callbacks;
    enabled_payments?: string[];
    qr_code?: QrCodeOptions;
    [key: string]: any;
  }

  interface TransactionResponse {
    token: string;
    redirect_url?: string;
    qr_string?: string;
    actions?: Array<{
      name: string;
      method: string;
      url: string;
    }>;
    [key: string]: any;
  }

  class Snap {
    constructor(options: SnapOptions);
    createTransaction(parameter: TransactionParameter): Promise<TransactionResponse>;
  }

  interface CoreApiOptions {
    isProduction: boolean;
    serverKey: string;
  }

  class CoreApi {
    constructor(options: CoreApiOptions);
    checkTransaction(orderId: string): Promise<any>;
  }

  export { Snap, CoreApi, SnapOptions, CoreApiOptions, TransactionParameter, TransactionResponse };
  export default { Snap, CoreApi };
}
