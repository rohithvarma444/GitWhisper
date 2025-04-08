'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Info } from 'lucide-react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns';
import axios from 'axios';

function BillingPage() {
  const { user } = useUser();

  if (!user) {
    redirect('/sign-in');
  }

  const userId = user?.id;
  const { data} = api.project.getMyCredits.useQuery({ userId });
  const credits = data?.credits || 0;
  const [creditsToBuy, setCreditsToBuy] = React.useState(100);
  const netAmount = creditsToBuy*2; // For example, 100 credits = $2.00

  const handleSliderChange = (value: number[]) => {
    setCreditsToBuy(value[0]);
  };

  const { data: transactions = [] } = api.project.getTransactions.useQuery({
    userId: user?.id,
  });

  const createOrder = async () => {
    try {
      const res = await axios.post('/api/createOrder', {
        amount: Number(netAmount) * 100, // convert to smallest currency unit
      });

      const { id: order_id } = res.data;

      console.log('-------------------Order ID:', order_id);
      console.log('-----------------', process.env.RAZORPAY_KEY_ID);

      const paymentData = {
        key: process.env.RAZORPAY_KEY_ID,
        order_id,
        amount: Number(netAmount) * 100,
        currency: 'INR',
        name: 'Your App Name',
        description: `Purchase of ${creditsToBuy} credits`,
        handler: async function (response: any) {
          try {
            const verifyRes = await axios.post('/api/verifyOrder', {
              orderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data.isOk) {
              alert('Payment successful');
              // Optionally refresh credits/transactions
            } else {
              alert('Payment verification failed');
            }
          } catch (err) {
            console.error(err);
            alert('Verification failed');
          }
        },
        prefill: {
          email: user?.primaryEmailAddress?.emailAddress || '',
          name: user?.fullName || '',
        },
        theme: {
          color: '#6366f1',
        },
      };

      const payment = new (window as any).Razorpay(paymentData);
      payment.open();
    } catch (error) {
      console.error(error);
      alert('Failed to create payment order');
    }
  };

  return (
    <div className="w-full p-8 space-y-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-gray-600">
          You currently have <strong>{credits}</strong> credits.
        </p>

        <div className="bg-blue-50 border border-gray-200 p-4 rounded flex items-start gap-3 text-sm text-gray-800">
          <Info className="mt-1 h-5 w-5 text-black" />
          <span>
            Each credit allows you to index 1 file in a repository. <br />
            <strong>Example:</strong> If your project has 100 files, you will need 100 credits to index it.
          </span>
        </div>

        <Slider
          min={50}
          max={1000}
          step={10}
          defaultValue={[creditsToBuy]}
          onValueChange={handleSliderChange}
        />

        <Button
          onClick={createOrder}
          className="w-full bg-primary text-white py-2 px-4 rounded"
        >
          Buy {creditsToBuy} credits for ${netAmount}
        </Button>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn: any) => (
              <div
                key={txn.id}
                className={`border-2 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between ${
                  txn.status === 'failed' ? 'border-red-500' : 'border-green-500'
                }`}
              >
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Date:</span>{' '}
                    {format(new Date(txn.createdAt), 'dd MMM yyyy, hh:mm a')}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Credits:</span> {txn.credits}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Amount:</span> ${txn.amount.toFixed(2)}
                  </p>
                </div>
                <span
                  className={`text-xs mt-2 sm:mt-0 px-3 py-1 rounded-full font-semibold ${
                    txn.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {txn.status === 'failed' ? 'Failed' : 'Success'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BillingPage;