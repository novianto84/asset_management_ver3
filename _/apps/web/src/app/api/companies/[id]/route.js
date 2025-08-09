import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get single company
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await sql`
      SELECT 
        c.*,
        created_user.name as created_by_name,
        updated_user.name as updated_by_name
      FROM companies c
      LEFT JOIN users created_user ON c.created_by = created_user.id
      LEFT JOIN users updated_user ON c.updated_by = updated_user.id
      WHERE c.id = ${parseInt(id)} AND c.deleted_at IS NULL
    `;

    if (result.length === 0) {
      return Response.json({ error: "Company not found" }, { status: 404 });
    }

    return Response.json({ company: result[0] });
  } catch (error) {
    console.error("Error fetching company:", error);
    return Response.json({ error: "Failed to fetch company" }, { status: 500 });
  }
}

// Update company
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    if (!data.name) {
      return Response.json(
        { error: "Company name is required" },
        { status: 400 },
      );
    }

    // Get current user ID from users table
    const userResult = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    const currentUserId = userResult[0]?.id;

    const result = await sql`
      UPDATE companies 
      SET 
        name = ${data.name},
        address = ${data.address || null},
        phone = ${data.phone || null},
        contact_person = ${data.contact_person || null},
        email = ${data.email || null},
        customer_photo = ${data.customer_photo || null},
        industry = ${data.industry || null},
        updated_by = ${currentUserId},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)} AND deleted_at IS NULL
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "Company not found" }, { status: 404 });
    }

    return Response.json({ company: result[0] });
  } catch (error) {
    console.error("Error updating company:", error);
    return Response.json(
      {
        error: "Failed to update company",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// Soft delete company
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get current user ID from users table
    const userResult = await sql`
      SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    const currentUserId = userResult[0]?.id;

    // Check if company has related units
    const unitsCheck = await sql`
      SELECT COUNT(*) as unit_count FROM units 
      WHERE company_id = ${parseInt(id)} AND deleted_at IS NULL
    `;

    if (parseInt(unitsCheck[0]?.unit_count) > 0) {
      return Response.json(
        {
          error: "Cannot delete company with active units",
          details: `This company has ${unitsCheck[0].unit_count} active units. Please remove or reassign the units first.`,
        },
        { status: 400 },
      );
    }

    const result = await sql`
      UPDATE companies 
      SET 
        deleted_at = CURRENT_TIMESTAMP,
        deleted_by = ${currentUserId}
      WHERE id = ${parseInt(id)} AND deleted_at IS NULL
      RETURNING id, name, deleted_at
    `;

    if (result.length === 0) {
      return Response.json({ error: "Company not found" }, { status: 404 });
    }

    return Response.json({
      message: "Company deleted successfully",
      company: result[0],
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return Response.json(
      { error: "Failed to delete company" },
      { status: 500 },
    );
  }
}
