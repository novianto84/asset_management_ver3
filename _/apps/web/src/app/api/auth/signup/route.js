import sql from "@/app/api/utils/sql";

// Simple OTP generation (for demo - in production use proper SMS service)
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { name, email, phone, address, password } = await request.json();

    console.log("Signup attempt for:", email);

    // Validate required fields
    if (!name || !email || !phone || !address || !password) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Validate phone format
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return Response.json(
        { error: "Please enter a valid Indonesian phone number" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT email FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUser.length > 0) {
      return Response.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    // Check if phone already exists
    const existingPhone = await sql`
      SELECT phone FROM users WHERE phone = ${phone} LIMIT 1
    `;

    if (existingPhone.length > 0) {
      return Response.json(
        { error: "Phone number already registered" },
        { status: 400 },
      );
    }

    // Generate verification code
    const verificationCode = generateOTP();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean phone number (remove spaces and standardize format)
    const cleanPhone = phone.replace(/\s/g, "").replace(/^(\+62|62)/, "0");

    // Create user with guest role and unverified phone
    const newUser = await sql`
      INSERT INTO users (
        name, 
        email, 
        phone, 
        address,
        role, 
        is_active, 
        phone_verified, 
        verification_code, 
        verification_expires,
        last_verification_sent
      )
      VALUES (
        ${name}, 
        ${email}, 
        ${cleanPhone}, 
        ${address},
        'guest', 
        false, 
        false, 
        ${verificationCode}, 
        ${verificationExpires.toISOString()},
        NOW()
      )
      RETURNING id, name, email, phone, address, role
    `;

    // Also create auth_users record for compatibility
    await sql`
      INSERT INTO auth_users (name, email)
      VALUES (${name}, ${email})
      ON CONFLICT (email) DO NOTHING
    `;

    console.log("User created successfully:", newUser[0]);

    // In a real application, you would send SMS here
    // For demo purposes, we'll log the code
    console.log(
      `📱 SMS would be sent to ${cleanPhone}: Your verification code is ${verificationCode}`,
    );

    return Response.json({
      success: true,
      message: "Registration successful! Verification code sent to your phone.",
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        phone: newUser[0].phone,
        role: newUser[0].role,
      },
      // In demo mode, include the code (remove in production)
      demo_code: verificationCode,
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.message.includes("duplicate key")) {
      return Response.json(
        { error: "Email or phone number already exists" },
        { status: 400 },
      );
    }

    return Response.json(
      { error: "Registration failed: " + error.message },
      { status: 500 },
    );
  }
}
