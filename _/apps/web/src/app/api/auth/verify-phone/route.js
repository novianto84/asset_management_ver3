import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { email, code } = await request.json();

    console.log("Phone verification attempt for:", email, "with code:", code);

    if (!email || !code) {
      return Response.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // Find user and check verification code
    const user = await sql`
      SELECT id, name, email, phone, verification_code, verification_expires, phone_verified
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

    // Check if code exists
    if (!userData.verification_code) {
      return Response.json(
        { error: "No verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if code expired
    const now = new Date();
    const expires = new Date(userData.verification_expires);
    if (now > expires) {
      return Response.json(
        { error: "Verification code expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if code matches
    if (userData.verification_code !== code) {
      return Response.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Verify the user
    await sql`
      UPDATE users 
      SET 
        phone_verified = true,
        is_active = true,
        verification_code = NULL,
        verification_expires = NULL,
        updated_at = NOW()
      WHERE email = ${email}
    `;

    console.log("Phone verified successfully for:", email);

    return Response.json({
      success: true,
      message: "Phone number verified successfully! You can now sign in.",
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        phone_verified: true
      }
    });

  } catch (error) {
    console.error("Phone verification error:", error);
    return Response.json(
      { error: "Verification failed: " + error.message },
      { status: 500 }
    );
  }
}