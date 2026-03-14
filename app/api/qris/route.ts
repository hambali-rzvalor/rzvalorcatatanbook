import { NextRequest, NextResponse } from 'next/server';
import MidtransClient from 'midtrans-client';
import { db, qrisPayments, transactions } from '@/db';
import { eq } from 'drizzle-orm';

// Initialize Midtrans Snap
function getSnap() {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  const clientKey = process.env.MIDTRANS_CLIENT_KEY || '';
  
  return new MidtransClient.Snap({
    isProduction,
    serverKey,
    clientKey,
  });
}

// GET - Check payment status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get payment from database
    const payment = await db
      .select()
      .from(qrisPayments)
      .where(eq(qrisPayments.orderId, orderId))
      .limit(1);

    if (payment.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment[0],
    });
  } catch (error) {
    console.error('Error checking QRIS payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}

// POST - Create QRIS payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description, portions, transactionDate } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const orderId = `TAHUWALIK-${timestamp}-${randomId}`;

    // Initialize Midtrans Snap
    const snap = getSnap();

    // Prepare transaction parameter for Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: parseInt(amount),
      },
      item_details: [
        {
          id: 'TAHUWALIK-SALE',
          price: parseInt(amount),
          quantity: 1,
          name: description || 'Penjualan Tahu Walik',
        },
      ],
      callbacks: {
        finish: `${process.env.APP_URL || 'http://localhost:3000'}/api/qris/callback`,
      },
      enabled_payments: ['QRIS'],
      qr_code: {
        is_reusable: false,
      },
    };

    // Create transaction with Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Save to database
    const [newPayment] = await db
      .insert(qrisPayments)
      .values({
        orderId,
        amount: amount.toString(),
        status: 'pending',
        qrString: transaction.qr_string || null,
        actions: JSON.stringify(transaction.actions || []),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
        metadata: JSON.stringify({
          description,
          portions,
          transactionDate,
        }),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        orderId: newPayment.orderId,
        qrString: transaction.qr_string,
        actions: transaction.actions,
        amount: amount,
        expiresAt: newPayment.expiresAt,
      },
      message: 'QRIS payment created successfully',
    });
  } catch (error) {
    console.error('Error creating QRIS payment:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create QRIS payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
