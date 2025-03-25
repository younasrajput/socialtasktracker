import { getCurrentUserToken } from './firebase';

// Base URL for the Payment API
const API_BASE_URL = 'https://socialtaskhub-payment-api.yourdomain.workers.dev';

/**
 * Interface for payment details returned from the API
 */
export interface PaymentDetails {
  bankAccounts?: {
    name: string;
    accountNumber: string;
    routingNumber?: string;
    bankName: string;
    swift?: string;
    iban?: string;
  }[];
  cryptoAddresses?: {
    currency: string;
    address: string;
    network?: string;
  }[];
  paypal?: {
    email: string;
  };
}

/**
 * Fetch bank/crypto payment details based on user's country
 * @param country - The user's country code (e.g., 'US', 'UK')
 * @returns Promise with payment details
 */
export const getBankDetails = async (country: string): Promise<PaymentDetails> => {
  try {
    // Get the user's authentication token
    const token = await getCurrentUserToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Make the API request
    const response = await fetch(
      `${API_BASE_URL}/api/get-bank-details?country=${encodeURIComponent(country)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch payment details');
    }
    
    const data = await response.json();
    return data.paymentDetails;
  } catch (error: any) {
    console.error('Error fetching payment details:', error);
    throw new Error(error.message || 'Failed to fetch payment details');
  }
};