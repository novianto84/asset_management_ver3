import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get single user by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const users = await sql(
      `
      SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at, u.updated_at,
        created_user.name as created_by_name,
        updated_user.name as updated_by_name
      FROM users u
      LEFT JOIN users created_user ON u.created_by = created_user.id
      LEFT JOIN users updated_user ON u.updated_by = updated_user.id
      WHERE u.id = $1 AND u.deleted_at IS NULL
      `,
      [id],
    );

    if (users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user: users[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    return Response.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// Update user
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    // Get current user ID from users table
    const currentUserResult = await sql`
      SELECT id, role FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    const currentUser = currentUserResult[0];
    if (!currentUser) {
      return Response.json(
        { error: "User session not found" },
        { status: 401 },
      );
    }

    // Check if user exists
    const existingUsers = await sql(
      `SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (existingUsers.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Validate role if provided
    if (data.role) {
      const validRoles = ["admin", "supervisor", "teknisi", "sales"];
      if (!validRoles.includes(data.role)) {
        return Response.json(
          { error: "Invalid role. Must be one of: " + validRoles.join(", ") },
          { status: 400 },
        );
      }
    }

    // Check if email already exists (excluding current user)
    if (data.email) {
      const emailCheck = await sql(
        `SELECT id FROM users WHERE email = $1 AND id != $2 AND deleted_at IS NULL`,
        [data.email, id],
      );

      if (emailCheck.length > 0) {
        return Response.json(
          { error: "Email already exists" },
          { status: 400 },
        );
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (data.name !== undefined) {
      paramCount++;
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(data.name);
    }

    if (data.email !== undefined) {
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(data.email);
    }

    if (data.phone !== undefined) {
      paramCount++;
      updateFields.push(`phone = $${paramCount}`);
      updateValues.push(data.phone);
    }

    if (data.role !== undefined) {
      paramCount++;
      updateFields.push(`role = $${paramCount}`);
      updateValues.push(data.role);
    }

    if (data.is_active !== undefined) {
      paramCount++;
      updateFields.push(`is_active = $${paramCount}`);
      updateValues.push(data.is_active);
    }

    if (updateFields.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    // Add updated_by
    paramCount++;
    updateFields.push(`updated_by = $${paramCount}`);
    updateValues.push(currentUser.id);

    // Add user ID as the last parameter
    paramCount++;
    updateValues.push(id);

    const query = `
      UPDATE users 
      SET ${updateFields.join(", ")} 
      WHERE id = $${paramCount} AND deleted_at IS NULL
      RETURNING id, name, email, phone, role, is_active, created_at, updated_at
    `;

    const result = await sql(query, updateValues);

    return Response.json({ user: result[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json(
      {
        error: "Failed to update user",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// Delete user (soft delete by setting deleted_at and is_active = false)
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const currentUserResult = await sql`
      SELECT id, role FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    const currentUser = currentUserResult[0];
    if (!currentUser || currentUser.role !== "admin") {
      return Response.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const { id } = params;

    // Check if user exists
    const existingUsers = await sql(
      `SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (existingUsers.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Soft delete by setting deleted_at and is_active = false
    const result = await sql(
      `UPDATE users 
       SET is_active = false, deleted_at = CURRENT_TIMESTAMP, deleted_by = $1
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING id, name, email, role, is_active, deleted_at`,
      [currentUser.id, id],
    );

    return Response.json({
      message: "User deactivated successfully",
      user: result[0],
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json(
      {
        error: "Failed to delete user",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
