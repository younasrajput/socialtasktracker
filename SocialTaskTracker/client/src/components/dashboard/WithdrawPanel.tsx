import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface WithdrawPanelProps {
  availableBalance: number; // in cents
  onWithdraw: () => void; // Callback to refresh data after withdrawal
}

// Form validation schema
const withdrawSchema = z.object({
  amount: z.string()
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Amount must be greater than 0")
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num <= 1000; // Example max $1,000
    }, "Maximum withdrawal is $1,000"),
  paymentMethod: z.enum(['paypal', 'bank_transfer', 'crypto']),
  accountDetails: z.string().min(5, "Account details are required"),
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

const WithdrawPanel = ({ availableBalance, onWithdraw }: WithdrawPanelProps) => {
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState<WithdrawFormValues | null>(null);

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: '',
      paymentMethod: 'paypal',
      accountDetails: '',
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: WithdrawFormValues) => {
      // Convert amount to cents for API
      const amountInCents = Math.round(parseFloat(data.amount) * 100);
      
      return apiRequest('POST', '/api/user/withdraw', {
        amount: amountInCents,
        paymentMethod: data.paymentMethod,
        accountDetails: data.accountDetails,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Withdrawal Initiated',
        description: 'Your withdrawal request has been successfully initiated.',
      });
      setIsConfirmOpen(false);
      form.reset();
      onWithdraw();
    },
    onError: (error: any) => {
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'An error occurred while processing your withdrawal.',
        variant: 'destructive',
      });
      setIsConfirmOpen(false);
    },
  });

  const onSubmit = (values: WithdrawFormValues) => {
    const amountInCents = Math.round(parseFloat(values.amount) * 100);
    
    // Check if amount is greater than available balance
    if (amountInCents > availableBalance) {
      form.setError('amount', { 
        type: 'manual', 
        message: 'Amount exceeds available balance' 
      });
      return;
    }
    
    // Show confirmation dialog
    setWithdrawData(values);
    setIsConfirmOpen(true);
  };
  
  const handleConfirmWithdraw = () => {
    if (withdrawData) {
      withdrawMutation.mutate(withdrawData);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
            Withdraw Funds
          </CardTitle>
          <CardDescription>
            Withdraw your earnings to your preferred payment method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 font-medium">Available Balance</p>
            <p className="text-2xl font-semibold text-green-600">{formatCurrency(availableBalance)}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount to Withdraw</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Details</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your account details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit"
                className="w-full"
                disabled={availableBalance === 0}
              >
                {availableBalance === 0 ? (
                  'No Funds Available to Withdraw'
                ) : (
                  'Withdraw Funds'
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-medium text-sm mb-2">Processing Times</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center">
                <ArrowRight className="h-3 w-3 mr-1 text-gray-400" />
                PayPal: 1-2 business days
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-3 w-3 mr-1 text-gray-400" />
                Bank Transfer: 3-5 business days
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-3 w-3 mr-1 text-gray-400" />
                Cryptocurrency: 1-24 hours
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Withdrawal</DialogTitle>
            <DialogDescription>
              Please review your withdrawal details before proceeding.
            </DialogDescription>
          </DialogHeader>
          
          {withdrawData && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold">${withdrawData.amount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-semibold capitalize">
                    {withdrawData.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Account</span>
                  <span className="font-semibold">{withdrawData.accountDetails}</span>
                </div>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-md mt-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  Withdrawals cannot be cancelled once initiated. Processing times vary by payment method.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmOpen(false)}
              disabled={withdrawMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmWithdraw}
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                'Confirm Withdrawal'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WithdrawPanel;