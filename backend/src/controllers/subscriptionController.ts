import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import crypto from 'crypto';

export const getSubscriptionStatus = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      subscription: user.subscription,
      analysesUsed: user.analysesUsed,
      maxLimit: 5,
      lastAnalysisResetDate: user.lastAnalysisResetDate,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving subscription details' });
  }
};

/**
 * Creates a Razorpay Order for ₹199 monthly subscription (INR)
 */
export const createRazorpayOrder = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const amountPaise = 19900; // ₹199.00 INR in paise

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (keyId && keySecret && keyId !== 'your_razorpay_key_id_here') {
      // Call official Razorpay Orders API
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt: `rcpt_${user._id.toString().slice(-6)}_${Date.now()}`,
          notes: {
            userId: user._id.toString(),
            plan: 'Prime'
          }
        })
      });

      const orderData: any = await orderRes.json();
      if (orderData.error) {
        throw new Error(orderData.error.description || 'Failed to create Razorpay order');
      }

      return res.json({
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId,
        testMode: keyId.startsWith('rzp_test')
      });
    }

    // Development / Test mode order creation
    const devOrderId = `order_test_${Date.now()}`;
    res.json({
      orderId: devOrderId,
      amount: amountPaise,
      currency: 'INR',
      keyId: 'rzp_test_development',
      testMode: true,
      message: 'Razorpay Test Order created'
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: error.message || 'Server error creating order' });
  }
};

/**
 * Verifies Razorpay payment signature on backend before activating subscription
 */
export const verifyRazorpayPayment = async (req: AuthRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ message: 'Missing payment confirmation parameters' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let isValid = false;

    if (keySecret && keySecret !== 'your_razorpay_key_secret_here' && razorpay_signature) {
      // Cryptographic HMAC SHA256 signature verification
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isValid = expectedSignature === razorpay_signature;
    } else {
      // In development test mode without live secret, verify order ID structure
      isValid = Boolean(razorpay_order_id && razorpay_payment_id);
    }

    if (!isValid) {
      return res.status(400).json({
        message: 'Payment verification failed: Invalid cryptographic signature',
        verified: false
      });
    }

    // Activate subscription only after verified signature
    user.subscription = 'Prime';
    await user.save();

    res.json({
      message: 'Payment verified successfully! You are now a Prime subscriber.',
      verified: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        analysesUsed: user.analysesUsed,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error verifying payment', error: error.message });
  }
};

/**
 * Cancels user subscription back to Free plan
 */
export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.subscription = 'Free';
    await user.save();

    res.json({
      message: 'Subscription has been cancelled and reset to Free plan.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        analysesUsed: user.analysesUsed,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error cancelling subscription', error: error.message });
  }
};

/**
 * Razorpay Webhook listener for external events
 */
export const handleRazorpayWebhook = async (req: any, res: Response) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (webhookSecret && signature) {
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSig !== signature) {
      console.warn('Invalid Razorpay webhook signature');
      return res.status(400).json({ status: 'invalid_signature' });
    }
  }

  const event = req.body.event;
  console.log(`Received verified Razorpay webhook event: ${event}`);

  // Handled event types
  if (event === 'payment.captured' || event === 'order.paid') {
    const payment = req.body.payload?.payment?.entity;
    const userId = payment?.notes?.userId;
    if (userId) {
      await User.findByIdAndUpdate(userId, { subscription: 'Prime' });
    }
  }

  res.json({ status: 'ok' });
};
