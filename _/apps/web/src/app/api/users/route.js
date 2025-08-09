import sql from "@/app/api/utils/sql";

// Get all users
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const role = url.searchParams.get("role");
    const active = url.searchParams.get("active");

    let query = `
      SELECT 
        id, name, email, phone, role, is_active, created_at
      FROM users 
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(name) LIKE LOWER($${paramCount}) OR 
        LOWER(email) LIKE LOWER($${paramCount}) OR 
        LOWER(phone) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
    }

    if (role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      params.push(role);
    }

    if (active !== null && active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      params.push(active === 'true');
    }

    query += ` ORDER BY created_at DESC`;

    const users = await sql(query, params);

    return Response.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// Create new user
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.role) {
      return Response.json(
        { error: "Name, email, and role are required" }, 
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'supervisor', 'teknisi', 'sales'];
    if (!validRoles.includes(data.role)) {
      return Response.json(
        { error: "Invalid role. Must be one of: " + validRoles.join(', ') }, 
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await sql(
      `SELECT id FROM users WHERE email = $1`,
      [data.email]
    );

    if (existingUser.length > 0) {
      return Response.json(
        { error: "Email already exists" }, 
        { status: 400 }
      );
    }

    const result = await sql(
      `
      INSERT INTO users (name, email, phone, role, is_active) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, name, email, phone, role, is_active, created_at
      `,
      [
        data.name,
        data.email,
        data.phone || null,
        data.role,
        data.is_active !== undefined ? data.is_active : true
      ]
    );

    return Response.json({ user: result[0] });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json(
      { 
        error: "Failed to create user",
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}