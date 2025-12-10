import { useState } from 'react';
import { Loader2, CreditCard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRazorpay } from '@/hooks/buyer';

interface CheckoutCardProps {
  addressId: number;
  amount: number;
  shippingCharges: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function CheckoutCard({
  addressId,
  amount,
  shippingCharges,
  onSuccess,
  onError,
}: CheckoutCardProps) {
  const { initiatePayment, isCreatingOrder } = useRazorpay();
  const [error, setError] = useState<string | null>(null);

  const totalAmount = amount + shippingCharges;

  const handlePayment = async () => {
    try {
      setError(null);
      await initiatePayment(
        { addressId },
        {
          onSuccess: () => {
            onSuccess?.();
          },
          onError: (err) => {
            setError(err);
            onError?.(err);
          },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription>Complete your order payment securely</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order Amount</span>
            <span className="font-medium">₹{amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping Charges</span>
            <span className="font-medium">₹{shippingCharges.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="text-base font-semibold">Total Amount</span>
              <span className="text-lg font-bold">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Secure Payment</AlertTitle>
          <AlertDescription className="text-xs">
            Your payment is secured by Razorpay with 256-bit encryption
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Payment Error</AlertTitle>
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg" onClick={handlePayment} disabled={isCreatingOrder}>
          {isCreatingOrder ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ₹{totalAmount.toFixed(2)}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
