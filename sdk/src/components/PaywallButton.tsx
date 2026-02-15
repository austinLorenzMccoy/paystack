import React from 'react';
import { PaywallButtonProps } from '../types';

export function PaywallButton({
  contentId,
  price,
  asset = 'STX',
  onSuccess,
  onError,
  className = ''
}: PaywallButtonProps) {
  const handlePayment = async () => {
    try {
      // Payment logic would go here
      // For now, this is a placeholder for the published package
      console.log('Payment initiated:', { contentId, price, asset });
      
      if (onSuccess) {
        onSuccess('mock-tx-id');
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  };

  return (
    <button
      onClick={handlePayment}
      className={`x402pay-button ${className}`}
      data-content-id={contentId}
      data-price={price}
      data-asset={asset}
    >
      Pay {price} {asset}
    </button>
  );
}
