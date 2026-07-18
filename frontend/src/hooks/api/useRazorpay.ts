import { useState } from 'react';
import api from '@/lib/axios';

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createOrder = async (subscriptionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/razorpay/create-order', { subscriptionId });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentLink = async (subscriptionId: string, memberId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/razorpay/payment-link', { subscriptionId, memberId });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate payment link');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (data: {
    subscriptionId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/razorpay/verify', data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify payment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const simulateMockSuccess = async (orderId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/mock/payment/success', { orderId });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to trigger mock webhook');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadRazorpayScript,
    createOrder,
    createPaymentLink,
    verifyPayment,
    simulateMockSuccess,
    isLoading,
    error,
  };
}
