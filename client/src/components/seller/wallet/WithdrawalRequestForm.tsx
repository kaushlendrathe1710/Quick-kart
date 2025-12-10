import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useSellerWallet } from '@/hooks/seller';
import type { Wallet } from '@shared/types';

const bankAccountSchema = z.object({
  accountNumber: z.string().min(9).max(18),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
  accountHolderName: z.string().min(2).max(100),
  bankName: z.string().min(2).max(100),
});

const upiSchema = z.object({
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID'),
  upiHolderName: z.string().min(2).max(100),
});

const withdrawalFormSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
  paymentMethod: z.enum(['bank_transfer', 'upi']),
  accountDetails: z.string(),
});

type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

interface WithdrawalFormProps {
  wallet: Wallet;
}

export function WithdrawalRequestForm({ wallet }: WithdrawalFormProps) {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'upi'>('bank_transfer');
  const { requestWithdrawal, isRequestingWithdrawal } = useSellerWallet();

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      amount: '',
      paymentMethod: 'bank_transfer',
      accountDetails: '',
    },
  });

  const bankForm = useForm({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      bankName: '',
    },
  });

  const upiForm = useForm({
    resolver: zodResolver(upiSchema),
    defaultValues: {
      upiId: '',
      upiHolderName: '',
    },
  });

  const onSubmit = async (values: WithdrawalFormValues) => {
    try {
      let accountDetails: string;

      if (paymentMethod === 'bank_transfer') {
        const isValid = await bankForm.trigger();
        if (!isValid) return;
        accountDetails = JSON.stringify(bankForm.getValues());
      } else {
        const isValid = await upiForm.trigger();
        if (!isValid) return;
        accountDetails = JSON.stringify(upiForm.getValues());
      }

      requestWithdrawal(
        {
          amount: values.amount,
          paymentMethod,
          accountDetails,
        },
        {
          onSuccess: () => {
            setOpen(false);
            form.reset();
            bankForm.reset();
            upiForm.reset();
          },
        }
      );
    } catch (error) {
      console.error('Withdrawal request error:', error);
    }
  };

  const maxWithdrawable = parseFloat(wallet.withdrawableBalance);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Request Withdrawal</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Withdrawal</DialogTitle>
          <DialogDescription>Available balance: ₹{maxWithdrawable.toFixed(2)}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter amount" {...field} />
                  </FormControl>
                  <FormDescription>
                    Minimum: ₹100 | Maximum: ₹{maxWithdrawable.toFixed(2)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        setPaymentMethod(value as 'bank_transfer' | 'upi');
                      }}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="bank_transfer" />
                        </FormControl>
                        <FormLabel className="font-normal">Bank Transfer</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="upi" />
                        </FormControl>
                        <FormLabel className="font-normal">UPI</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {paymentMethod === 'bank_transfer' ? (
              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-medium">Bank Account Details</h4>
                <Form {...bankForm}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={bankForm.control}
                      name="accountHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bankForm.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bankForm.control}
                      name="ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ABCD0123456" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bankForm.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              </div>
            ) : (
              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-medium">UPI Details</h4>
                <Form {...upiForm}>
                  <div className="space-y-4">
                    <FormField
                      control={upiForm.control}
                      name="upiId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UPI ID</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="username@upi" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={upiForm.control}
                      name="upiHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UPI Holder Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isRequestingWithdrawal}>
                {isRequestingWithdrawal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
