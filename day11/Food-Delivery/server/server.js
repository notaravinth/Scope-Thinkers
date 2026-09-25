import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import Razorpay from "razorpay";

dotenv.config({ path: "./server/.env" });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("Missing Razorpay environment variables.");
  process.exit(1);
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
app.post("/api/create-order", async (req, res) => {
  try {
    console.log("Create order request:", req.body);

    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount.",
      });
    }

    const amountInPaise = Math.round(amount * 100);

    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum payment amount is ₹1.",
      });
    }

    console.log("Creating Razorpay order:", {
      amount: amountInPaise,
      currency: "INR",
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `foodity_${Date.now()}`,
    });

    console.log("Razorpay order created:", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.error?.description ||
        error?.message ||
        "Unable to create Razorpay order.",
    });
  }
});

// Verify Razorpay payment
app.post("/api/verify-payment", (req, res) => {
  try {
    console.log("Payment verification request received.");

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields.",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expected = Buffer.from(generatedSignature);
    const received = Buffer.from(razorpay_signature);

    const isValid =
      expected.length === received.length &&
      crypto.timingSafeEqual(expected, received);

    console.log("Payment signature valid:", isValid);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.error?.description ||
        error?.message ||
        "Unable to verify payment.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Foodity server running on http://localhost:${PORT}`);
});