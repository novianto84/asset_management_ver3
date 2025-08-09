import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin or supervisor
    const userRole = await sql`
      SELECT role FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (userRole.length === 0 || !['admin', 'supervisor'].includes(userRole[0].role)) {
      return Response.json(
        { error: "Access denied. Admin or supervisor role required." },
        { status: 403 }
      );
    }

    // Get all users with their roles
    const users = await sql`
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        role, 
        is_active, 
        phone_verified,
        created_at,
        updated_at
      FROM users 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    return Response.json({
      success: true,
      users: users,
      total: users.length
    });

  } catch (error) {
    console.error("Get users error:", error);
    return Response.json(
      { error: "Failed to fetch users: " + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin or supervisor
    const adminUser = await sql`
      SELECT id, role FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (adminUser.length === 0 || !['admin', 'supervisor'].includes(adminUser[0].role)) {
      return Response.json(
        { error: "Access denied. Admin or supervisor role required." },
        { status: 403 }
      );
    }

    const { userId, newRole, isActive } = await request.json();

    if (!userId) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'supervisor', 'teknisi', 'sales', 'guest'];
    if (newRole && !validRoles.includes(newRole)) {
      return Response.json(
        { error: "Invalid role. Must be one of: " + validRoles.join(', ') },
        { status: 400 }
      );
    }

    // Get target user info
    const targetUser = await sql`
      SELECT id, name, email, role FROM users WHERE id = ${userId} LIMIT 1
    `;

    if (targetUser.length === 0) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent users from modifying their own role (except admin can)
    if (targetUser[0].email === session.user.email && adminUser[0].role !== 'admin') {
      return Response.json(
        { error: "You cannot modify your own role" },
        { status: 403 }
      );
    }

    // Only admin can create other admins
    if (newRole === 'admin' && adminUser[0].role !== 'admin') {
      return Response.json(
        { error: "Only admin can grant admin role" },
        { status: 403 }
      );
    }

    // Build update query dynamically
    let updateFields = [];
    let values = [];
    
    if (newRole) {
      updateFields.push(`role = $${updateFields.length + 1}`);
      values.push(newRole);
    }
    
    if (typeof isActive === 'boolean') {
      updateFields.push(`is_active = $${updateFields.length + 1}`);
      values.push(isActive);
    }

    if (updateFields.length === 0) {
      return Response.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = NOW()`);
    updateFields.push(`updated_by = $${updateFields.length}`);
    values.push(adminUser[0].id);

    // Update user
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${values.length}
      RETURNING id, name, email, role, is_active, phone_verified
    `;
    
    values.push(userId);

    const updatedUser = await sql(updateQuery, values);

    console.log(`User role updated by ${session.user.email}:`, {
      targetUser: targetUser[0].email,
      newRole: newRole,
      isActive: isActive
    });

    return Response.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser[0]
    });

  } catch (error) {
    console.error("Update user role error:", error);
    return Response.json(
      { error: "Failed to update user: " + error.message },
      { status: 500 }
    );
  }
}