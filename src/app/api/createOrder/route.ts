import {NextResponse} from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function POST(req: Request){
    const {amount} = await req.json();
    const options = razorpay.orders.create({
        amount: amount * 100, // Amount in paise
        currency: 'INR',
    })

    return NextResponse.json(options)
}