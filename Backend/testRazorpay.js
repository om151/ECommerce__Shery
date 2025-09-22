// Test script to verify Razorpay configuration
const Razorpay = require("razorpay");
require("dotenv").config();

async function testRazorpay() {
  try {
    console.log("🧪 Testing Razorpay Configuration...\n");

    // Check environment variables
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    console.log("📋 Environment Variables:");
    console.log(`RAZORPAY_KEY_ID: ${keyId ? "Set ✅" : "Missing ❌"}`);
    console.log(
      `RAZORPAY_KEY_SECRET: ${keySecret ? "Set ✅" : "Missing ❌"}\n`
    );

    if (!keyId || !keySecret) {
      console.error("❌ Razorpay credentials are not configured properly!");
      return;
    }

    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Test creating a sample order
    console.log("🔧 Creating test order...");
    const testOrder = await razorpay.orders.create({
      amount: 10000, // ₹100.00 in paise
      currency: "INR",
      receipt: `test_${Date.now()}`,
      notes: {
        test: true,
        description: "Test order for configuration verification",
      },
    });

    console.log("✅ Test order created successfully!");
    console.log("📦 Order Details:", {
      id: testOrder.id,
      amount: testOrder.amount / 100, // Convert back to rupees
      currency: testOrder.currency,
      status: testOrder.status,
      receipt: testOrder.receipt,
    });

    console.log("\n🎉 Razorpay configuration is working correctly!");
    console.log("💡 You can now process online payments in your application.");
  } catch (error) {
    console.error("❌ Razorpay configuration test failed:", error.message);

    if (error.statusCode === 401) {
      console.error(
        "🔐 Authentication failed - please check your Razorpay key and secret"
      );
    } else if (error.statusCode === 400) {
      console.error("📝 Bad request - check the order parameters");
    } else {
      console.error("🌐 Network or other error occurred");
    }
  }
}

testRazorpay();
