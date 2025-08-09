import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log("Sign in attempt for:", email);

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // For demo purposes, check against test accounts
    const testAccounts = {
      "admin@test.com": { name: "Admin User", role: "admin" },
      "supervisor@test.com": { name: "Supervisor User", role: "supervisor" },
      "teknisi@test.com": { name: "Teknisi User", role: "teknisi" },
      "sales@test.com": { name: "Sales User", role: "sales" },
    };

    if (testAccounts[email] && password === "password123") {
      console.log("Valid credentials for:", email);

      // Check if user exists in auth_users table
      let authUserResult = await sql`
        SELECT * FROM auth_users WHERE email = ${email} LIMIT 1
      `;

      let authUser;
      if (authUserResult.length === 0) {
        console.log("Creating new auth user for:", email);
        // Create user in auth_users table
        const insertResult = await sql`
          INSERT INTO auth_users (name, email, "emailVerified")
          VALUES (${testAccounts[email].name}, ${email}, NOW())
          RETURNING *
        `;
        authUser = insertResult[0];
      } else {
        authUser = authUserResult[0];
      }

      console.log("Auth user:", authUser);

      // Also ensure user exists in the users table
      const userResult = await sql`
        SELECT * FROM users WHERE email = ${email} LIMIT 1
      `;

      if (userResult.length === 0) {
        console.log("Creating new user record for:", email);
        await sql`
          INSERT INTO users (name, email, role, is_active)
          VALUES (${testAccounts[email].name}, ${email}, ${testAccounts[email].role}, true)
          ON CONFLICT (email) DO NOTHING
        `;
      }

      // Clear any existing sessions for this user
      await sql`
        DELETE FROM auth_sessions WHERE "userId" = ${authUser.id}
      `;

      // Create a simple session token
      const sessionToken =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      console.log("Creating session with token:", sessionToken);

      // Store session in database with longer expiry
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await sql`
        INSERT INTO auth_sessions ("userId", expires, "sessionToken")
        VALUES (${authUser.id}, ${expiresAt.toISOString()}, ${sessionToken})
      `;

      // Create response
      const response = Response.json({
        success: true,
        user: {
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          role: testAccounts[email].role,
        },
      });

      // Set multiple cookie formats to ensure compatibility
      const cookieValue = `next-auth.session-token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`;
      response.headers.set("Set-Cookie", cookieValue);

      console.log("Sign in successful for:", email);

      return response;
    }

    console.log("Invalid credentials for:", email);
    return Response.json(
      { error: "Invalid credentials. Use password123 for any test account." },
      { status: 401 },
    );
  } catch (error) {
    console.error("Error signing in:", error);
    return Response.json(
      { error: "Sign in failed: " + error.message },
      { status: 500 },
    );
  }
}
