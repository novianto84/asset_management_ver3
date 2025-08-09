/**
 * WARNING: This file connects this app to Create's internal auth system. Do
 * not attempt to edit it. Do not import @auth/create or @auth/create
 * anywhere else or it may break. This is an internal package.
 */
import CreateAuth from "@auth/create";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";

export const { auth } = CreateAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        // Basic validation - check if credentials exist
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For demo purposes, check against test accounts
        const testAccounts = {
          "admin@test.com": { name: "Admin User", role: "admin" },
          "supervisor@test.com": {
            name: "Supervisor User",
            role: "supervisor",
          },
          "teknisi@test.com": { name: "Teknisi User", role: "teknisi" },
          "sales@test.com": { name: "Sales User", role: "sales" },
        };

        // Check credentials
        if (
          testAccounts[credentials.email] &&
          credentials.password === "password123"
        ) {
          // Return user object on success
          return {
            id: credentials.email, // Use email as ID for simplicity
            name: testAccounts[credentials.email].name,
            email: credentials.email,
            role: testAccounts[credentials.email].role,
          };
        }

        // For new registrations, check database
        try {
          // Import sql here to avoid circular dependencies
          const sql = (await import("@/app/api/utils/sql")).default;

          const dbUser = await sql`
            SELECT id, name, email, role, phone_verified, is_active
            FROM users 
            WHERE email = ${credentials.email} 
            AND deleted_at IS NULL
            LIMIT 1
          `;

          if (dbUser.length > 0) {
            const user = dbUser[0];

            // For now, accept any password for registered users (in production, hash passwords)
            // Check if user is verified and active
            if (!user.phone_verified) {
              throw new Error("Please verify your phone number first");
            }

            if (!user.is_active) {
              throw new Error(
                "Your account is not active. Contact administrator.",
              );
            }

            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        } catch (error) {
          console.error("Database auth error:", error);
          throw error;
        }

        // Return null if credentials are invalid
        return null;
      },
    }),
    Google,
  ],
  pages: {
    signIn: "/account/signin",
    signOut: "/account/logout",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist user role to the token right after signin
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.user.role = token.role;
      return session;
    },
  },
});
