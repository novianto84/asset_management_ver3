import sql from "@/app/api/utils/sql";

// Simple OTP generation
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    console.log("Resend code request for:", email);

    if (!email) {
      return Response.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await sql`
      SELECT id, name, email, phone, phone_verified, last_verification_sent
      FROM users 
      WHERE email = ${email} 
      LIMIT 1
    `;

    if (user.length === 0) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = user[0];

    // Check if already verified
    if (userData.phone_verified) {
      return Response.json(
        { error: "Phone number already verified" },
        { status: 400 }
      );
    }

    // Check rate limiting (1 minute between requests)
    if (userData.last_verification_sent) {
      const lastSent = new Date(userData.last_verification_sent);
      const now = new Date();
      const timeDiff = (now - lastSent) / 1000; // seconds
      
      if (timeDiff < 60) {
        const remainingTime = Math.ceil(60 - timeDiff);
        return Response.json(
          { error: `Please wait ${remainingTime} seconds before requesting a new code` },
          { status: 429 }
        );
      }
    }

    // Generate new verification code
    const verificationCode = generateOTP();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new code
    await sql`
      UPDATE users 
      SET 
        verification_code = ${verificationCode},
        verification_expires = ${verificationExpires.toISOString()},
        last_verification_sent = NOW(),
        updated_at = NOW()
      WHERE email = ${email}
    `;

    // In a real application, you would send SMS here
    console.log(`📱 SMS would be sent to ${userData.phone}: Your verification code is ${verificationCode}`);

    return Response.json({
      success: true,
      message: "New verification code sent to your phone.",
      // In demo mode, include the code (remove in production)
      demo_code: verificationCode
    });

  } catch (error) {
    console.error("Resend code error:", error);
    return Response.json(
      { error: "Failed to resend code: " + error.message },
      { status: 500 }
    );
  }
}