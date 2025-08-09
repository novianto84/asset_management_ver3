export async function GET() {
  try {
    // Generate a simple CSRF token
    const csrfToken = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    
    return Response.json({ 
      csrfToken: csrfToken 
    });
  } catch (error) {
    console.error("Error generating CSRF token:", error);
    return Response.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}