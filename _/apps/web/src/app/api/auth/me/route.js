import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    let user = null;

    // First try the main auth system
    try {
      const session = await auth();
      if (session?.user?.email) {
        // Get user data from auth_users table
        const authUsers = await sql`
          SELECT 
            au.id, 
            au.name, 
            au.email, 
            au."emailVerified"
          FROM auth_users au
          WHERE au.email = ${session.user.email} 
          LIMIT 1
        `;

        if (authUsers.length > 0) {
          const authUser = authUsers[0];

          // Map email to role (since this is test system)
          let role = "user";
          if (authUser.email === "admin@test.com") role = "admin";
          else if (authUser.email === "supervisor@test.com")
            role = "supervisor";
          else if (authUser.email === "teknisi@test.com") role = "teknisi";
          else if (authUser.email === "sales@test.com") role = "sales";

          user = {
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            role: role,
            is_active: true,
            created_at: new Date().toISOString(),
          };
        }
      }
    } catch (authError) {
      console.log("Main auth failed, trying fallback:", authError.message);
    }

    // If main auth failed, try simple session token
    if (!user) {
      const cookies = request.headers.get("cookie") || "";
      const sessionTokenMatch = cookies.match(
        /next-auth\.session-token=([^;]+)/,
      );

      if (sessionTokenMatch) {
        const sessionToken = sessionTokenMatch[1];
        console.log("Checking session token:", sessionToken);

        // Check if session exists and is valid
        const sessions = await sql`
          SELECT 
            s."userId",
            s.expires,
            au.id,
            au.name,
            au.email
          FROM auth_sessions s
          JOIN auth_users au ON s."userId" = au.id
          WHERE s."sessionToken" = ${sessionToken} 
            AND s.expires > NOW()
          LIMIT 1
        `;

        if (sessions.length > 0) {
          const sessionData = sessions[0];

          // Map email to role
          let role = "user";
          if (sessionData.email === "admin@test.com") role = "admin";
          else if (sessionData.email === "supervisor@test.com")
            role = "supervisor";
          else if (sessionData.email === "teknisi@test.com") role = "teknisi";
          else if (sessionData.email === "sales@test.com") role = "sales";

          user = {
            id: sessionData.id,
            name: sessionData.name,
            email: sessionData.email,
            role: role,
            is_active: true,
            created_at: new Date().toISOString(),
          };

          console.log("Found valid session for:", sessionData.email);
        } else {
          console.log("No valid session found for token");
        }
      }
    }

    if (!user) {
      return Response.json({ user: null }, { status: 200 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return Response.json(
      { error: "Failed to fetch user data" },
      { status: 500 },
    );
  }
}
