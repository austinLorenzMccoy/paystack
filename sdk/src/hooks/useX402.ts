import { useState, useEffect } from 'react';
import { X402Config, X402Headers } from '../types';

export function useX402(config: X402Config) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize x402 configuration
    setIsReady(true);
  }, [config]);

  const checkPaymentRequired = async (url: string): Promise<X402Headers | null> => {
    try {
      const response = await fetch(url);
      
      if (response.status === 402) {
        return {
          'PAYMENT-REQUIRED': response.headers.get('PAYMENT-REQUIRED') || undefined,
          'PAYMENT-SIGNATURE': response.headers.get('PAYMENT-SIGNATURE') || undefined,
          'PAYMENT-RESPONSE': response.headers.get('PAYMENT-RESPONSE') || undefined,
        };
      }
      
      return null;
    } catch (error) {
      console.error('x402 check failed:', error);
      return null;
    }
  };

  return {
    isReady,
    checkPaymentRequired,
    config
  };
}
