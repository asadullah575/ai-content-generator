import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const origin = req.headers.get('origin') || 'https://ai-content-generator-fvb6.vercel.app';

    if (!stripeSecretKey) {
      // Graceful fallback if Stripe keys aren't configured yet
      return NextResponse.json({
        url: `${origin}/?success=true`
      });
    }

    // Call Stripe API to create a Checkout Session
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': 'Captioniq Pro (Unlimited Captions & Prompts)',
        'line_items[0][price_data][unit_amount]': '900', // $9.00 USD
        'line_items[0][price_data][recurring][interval]': 'month',
        'line_items[0][quantity]': '1',
        mode: 'subscription',
        success_url: `${origin}/?success=true`,
        cancel_url: `${origin}/?canceled=true`,
      }),
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error.message);
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate Stripe Checkout' },
      { status: 500 }
    );
  }
}
