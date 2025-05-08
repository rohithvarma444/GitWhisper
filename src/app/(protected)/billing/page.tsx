'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Info, Check, AlertCircle, Zap, Clock, CreditCard, ArrowRight, Shield } from 'lucide-react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function BillingPage() {
  const { user } = useUser();

  if (!user) {
    redirect('/sign-in');
  }

  const userId = user?.id;
  const { data } = api.project.getMyCredits.useQuery({ userId });
  const credits = data?.credits || 0;
  const [creditsToBuy, setCreditsToBuy] = React.useState(100);
  const netAmount = creditsToBuy * 2;

  const handleSliderChange = (value: number[]) => {
    setCreditsToBuy(value[0]);
  };

  const { data: transactions = [] } = api.project.getTransactions.useQuery({
    userId: user?.id,
  });

  const createOrder = async () => {
    // This function is kept for future implementation
    try {
      const res = await axios.post('/api/createOrder', {
        amount: Number(netAmount) * 100,
      });

      const { id: order_id } = res.data;

      const paymentData = {
        key: process.env.RAZORPAY_KEY_ID,
        order_id,
        amount: Number(netAmount) * 100,
        currency: 'INR',
        name: 'GitWhisper',
        description: `Purchase of ${creditsToBuy} credits`,
        handler: async function (response: any) {
          try {
            const verifyRes = await axios.post('/api/verifyOrder', {
              orderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data.isOk) {
              toast.success('Payment successful');
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            console.error(err);
            toast.error('Verification failed');
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
      toast.error('Failed to create payment order');
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Header Section */}
      <div className="mb-10 space-y-2">
        <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
          GitWhisper Free Tier
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Billing & Usage</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Manage your credits and track usage. GitWhisper is currently running on a free tier with limited indexing capabilities.
        </p>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Current Plan */}
        <Card className="lg:col-span-1 shadow-md border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Current Plan
            </CardTitle>
            <CardDescription>
              Your current subscription details
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">Free Tier</h3>
                <p className="text-sm text-muted-foreground">Limited indexing capabilities</p>
              </div>
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">
                Current
              </Badge>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Available Credits</span>
                <span className="font-bold text-lg">{credits}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${Math.min(credits / 10, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Each credit allows indexing of 1 file in a repository. There is no limit to how many credits you can use.
              </p>
            </div>
            
            <Alert className="mt-4 bg-amber-50 text-amber-800 border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Free Tier Limitations</AlertTitle>
              <AlertDescription className="text-xs">
                While there is no limit to available credits, you may experience rate limiting if you index too many files at once. If this happens, please wait a few minutes before trying again.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        
        {/* Middle Column - Buy Credits (Coming Soon) */}
        <Card className="lg:col-span-2 shadow-md border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Purchase Credits
            </CardTitle>
            <CardDescription>
              Add more credits to your account (Coming Soon)
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
              <h3 className="text-xl font-semibold mb-2">Select Credit Package</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Drag the slider to select how many credits you want to purchase
              </p>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Credits: {creditsToBuy}</span>
                    <span className="text-sm font-medium">₹{netAmount}</span>
                  </div>
                  <Slider
                    min={50}
                    max={1000}
                    step={10}
                    defaultValue={[creditsToBuy]}
                    onValueChange={handleSliderChange}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>50 credits</span>
                    <span>1000 credits</span>
                  </div>
                </div>
                
                <div className="bg-muted/40 rounded-lg p-4 border border-border">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Credits</span>
                    <span className="font-medium">{creditsToBuy}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Price per credit</span>
                    <span className="font-medium">₹2.00</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t mt-2">
                    <span className="text-sm font-medium">Total</span>
                    <span className="font-bold">₹{netAmount}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => {
                toast("We are running on the free tier, so we are currently not accepting payments.", {
                  description: "We'll notify you when subscription plans become available. Stay tuned!",
                  duration: 5000,
                });
              }}
              className="w-full bg-primary text-white py-6 rounded-lg text-base font-medium hover:bg-primary/90 transition-colors duration-200 h-auto"
              size="lg"
            >
              <Zap className="mr-2 h-5 w-5" />
              Coming Soon: Subscription Plans
            </Button>
            
            <div className="flex items-start gap-2 text-xs text-muted-foreground mt-2">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                GitWhisper is currently running on a free tier. You can use as many credits as needed, but may experience
                temporary rate limits if you index too many files at once. Subscription plans will be available soon, 
                enabling unlimited file indexing without rate limits and advanced features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Transaction History */}
      <Card className="mt-8 shadow-md border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Your past credit purchases and usage
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
              <p className="text-muted-foreground text-sm">No transactions yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your transaction history will appear here once you make a purchase</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn: any) => (
                <div
                  key={txn.id}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Date:</span>{' '}
                      {format(new Date(txn.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Credits:</span> {txn.credits}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Amount:</span> ₹{txn.amount.toFixed(2)}
                    </p>
                  </div>
                  <Badge
                    variant={txn.status === 'failed' ? 'destructive' : 'default'}
                    className="mt-2 sm:mt-0"
                  >
                    {txn.status === 'failed' ? 'Failed' : 'Success'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              Coming Soon: Subscription-based indexing will allow you to index all your files without any limits.
              Stay tuned for updates on our pricing plans.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default BillingPage;