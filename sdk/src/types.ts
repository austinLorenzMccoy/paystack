// x402Pay SDK Types

export interface PaywallButtonProps {
  contentId: string;
  price: number;
  asset?: 'STX' | 'sBTC' | 'USDCx';
  onSuccess?: (txId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface X402Config {
  contractAddress: string;
  network: 'mainnet' | 'testnet';
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface PaymentResult {
  txId: string;
  amount: number;
  asset: string;
  contentId: string;
  timestamp: string;
}

export interface X402Headers {
  'PAYMENT-REQUIRED'?: string;
  'PAYMENT-SIGNATURE'?: string;
  'PAYMENT-RESPONSE'?: string;
}
