import { NextRequest, NextResponse } from 'next/server';
import MidtransClient from 'midtrans-client';
import { db, qrisPayments } from '@/db';
import { eq } from 'drizzle-orm';
import { addTransaction } from '@/app/actions';

// POST - Handle Midtrans notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Midtrans notification received:', body);

    // Get order ID and transaction status from notification
    const orderId = body.order_id;
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID not found' },
        { status: 400 }
      );
    }

    // Find payment in database
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

    const paymentData = payment[0];
    let newStatus: 'pending' | 'success' | 'failed' | 'expired' = 'pending';

    // Determine payment status based on Midtrans response
    if (transactionStatus === 'capture') {
      // For credit card, but we handle QRIS too
      if (fraudStatus === 'accept') {
        newStatus = 'success';
      }
    } else if (transactionStatus === 'settlement') {
      // For QRIS and other payment methods
      newStatus = 'success';
    } else if (transactionStatus === 'pending') {
      newStatus = 'pending';
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel') {
      newStatus = 'failed';
    } else if (transactionStatus === 'expire') {
      newStatus = 'expired';
    }

    // Update payment status in database
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date(),
    };

    if (newStatus === 'success') {
      updateData.paidAt = new Date();

      // Create transaction record if not exists
      if (!paymentData.transactionId) {
        const metadata = paymentData.metadata as any;
        const transactionResult = await addTransaction({
          type: 'income',
          category: 'penjualan',
          description: metadata?.description || `Pembayaran QRIS - ${orderId}`,
          amount: parseInt(paymentData.amount),
          portions: metadata?.portions || 0,
          transactionDate: metadata?.transactionDate ? new Date(metadata.transactionDate) : new Date(),
        });

        if (transactionResult.success && transactionResult.data) {
          updateData.transactionId = (transactionResult.data as any).id;
        }
      }
    }

    await db
      .update(qrisPayments)
      .set(updateData)
      .where(eq(qrisPayments.orderId, orderId));

    console.log(`Payment ${orderId} status updated to ${newStatus}`);

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error('Error handling Midtrans notification:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process notification' },
      { status: 500 }
    );
  }
}
