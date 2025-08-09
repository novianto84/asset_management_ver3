import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { email, password, csrfToken } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // For demo purposes, check against test accounts
    const testAccounts = {
      "admin@test.com": { name: "Admin User", role: "admin" },
      "supervisor@test.com": { name: "Supervisor User", role: "supervisor" },
      "teknisi@test.com": { name: "Teknisi User", role: "teknisi" },
      "sales@test.com": { name: "Sales User", role: "sales" }
    };

    if (testAccounts[email] && password === "password123") {
      // Check if user exists in auth_users table
      let authUser = await sql`
        SELECT * FROM auth_users WHERE email = ${email} LIMIT 1
      `;

      if (authUser.length === 0) {
        // Create user in auth_users table
        authUser = await sql`
          INSERT INTO auth_users (name, email, "emailVerified")
          VALUES (${testAccounts[email].name}, ${email}, NOW())
          RETURNING *
        `;
      }

      return Response.json({
        user: {
          id: authUser[0].id,
          name: authUser[0].name,
          email: authUser[0].email,
          role: testAccounts[email].role
        },
        url: "/"
      });
    }

    return Response.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error signing in:", error);
    return Response.json(
      { error: "Sign in failed" },
      { status: 500 }
    );
  }
}