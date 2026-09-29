import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from "crypto";
import fs from "fs";
import Razorpay from "razorpay";

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

dotenv.config();

const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

const firebaseAdminApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
      })
    : getApps()[0];

const adminAuth = getAuth(firebaseAdminApp);

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

app.get("/", (req, res) => {
  res.json({
    message: "BusGo server is running",
  });
});

app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = otpStore.get(normalizedEmail);

    if (existing && Date.now() - existing.createdAt < 60 * 1000) {
      return res.status(429).json({
        message: "Please wait 60 seconds before requesting another OTP.",
      });
    }

    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    otpStore.set(normalizedEmail, {
      otpHash,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    await transporter.sendMail({
      from: `"BusGo" <${process.env.GMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Your BusGo OTP",
      text: `
Your BusGo verification code is ${otp}.

This code expires in 5 minutes.

If you did not request this code, you can safely ignore this email.
      `,
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: auto;
          padding: 30px;
        ">
          <h2>BusGo</h2>

          <p>Your verification code is:</p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            padding: 20px 0;
          ">
            ${otp}
          </div>

          <p>
            This code expires in 5 minutes.
          </p>

          <p style="color: #777;">
            If you didn't request this code,
            you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log(`OTP sent to ${normalizedEmail}`);

    res.json({
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    res.status(500).json({
      message: "Unable to send OTP.",
    });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const record = otpStore.get(normalizedEmail);

    if (!record) {
      return res.status(400).json({
        message: "No OTP found. Please request a new one.",
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);

      return res.status(400).json({
        message: "OTP expired. Please request a new one.",
      });
    }

    if (record.attempts >= 5) {
      otpStore.delete(normalizedEmail);

      return res.status(429).json({
        message: "Too many incorrect attempts.",
      });
    }

    const submittedHash = hashOTP(otp);

    if (submittedHash !== record.otpHash) {
      record.attempts += 1;

      return res.status(400).json({
        message: "Invalid OTP.",
      });
    }

    otpStore.delete(normalizedEmail);

    let userRecord;

    try {
      userRecord = await adminAuth.getUserByEmail(normalizedEmail);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        userRecord = await adminAuth.createUser({
          email: normalizedEmail,
          emailVerified: true,
        });
      } else {
        throw error;
      }
    }

    const customToken = await adminAuth.createCustomToken(
      userRecord.uid
    );

    console.log(`User authenticated: ${normalizedEmail}`);

    res.json({
      message: "OTP verified successfully.",
      token: customToken,
      uid: userRecord.uid,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    res.status(500).json({
      message: "Unable to verify OTP.",
    });
  }
});

app.post("/create-payment-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "A valid payment amount is required.",
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `busgo_${Date.now()}`,
      notes: {
        project: "BusGo Demo",
      },
    };

    const order = await razorpay.orders.create(options);

    console.log(`Razorpay order created: ${order.id}`);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    res.status(500).json({
      message: "Unable to create payment order.",
    });
  }
});

app.post("/verify-payment", async (req, res) => {
  try {
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
        message: "Payment verification data is incomplete.",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed.",
      });
    }

    console.log(`Payment verified: ${razorpay_payment_id}`);

    res.json({
      success: true,
      message: "Payment verified successfully.",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    res.status(500).json({
      message: "Unable to verify payment.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`BusGo server running on http://localhost:${PORT}`);
});