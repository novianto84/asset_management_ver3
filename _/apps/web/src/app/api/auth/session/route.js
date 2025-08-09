import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return Response.json({ user: null });
    }

    return Response.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      },
      expires: session.expires
    });
  } catch (error) {
    console.error("Error getting session:", error);
    return Response.json({ user: null });
  }
}