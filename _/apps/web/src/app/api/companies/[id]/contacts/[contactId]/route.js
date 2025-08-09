import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET /api/companies/[id]/contacts/[contactId] - Get a specific contact
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: companyId, contactId } = params;

    const [contact] = await sql`
      SELECT 
        cc.*,
        cb.name as created_by_name,
        ub.name as updated_by_name
      FROM company_contacts cc
      LEFT JOIN users cb ON cc.created_by = cb.id
      LEFT JOIN users ub ON cc.updated_by = ub.id
      WHERE cc.id = ${contactId} 
      AND cc.company_id = ${companyId}
      AND cc.deleted_at IS NULL
    `;

    if (!contact) {
      return Response.json({ error: "Contact not found" }, { status: 404 });
    }

    return Response.json({ contact });
  } catch (error) {
    console.error("Error fetching contact:", error);
    return Response.json({ error: "Failed to fetch contact" }, { status: 500 });
  }
}

// PUT /api/companies/[id]/contacts/[contactId] - Update a contact
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: companyId, contactId } = params;
    const userId = session.user.id;
    const body = await request.json();
    const { name, position, email, phone, is_primary, notes } = body;

    // Validate required fields
    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if contact exists
    const [existingContact] = await sql`
      SELECT id FROM company_contacts 
      WHERE id = ${contactId} AND company_id = ${companyId} AND deleted_at IS NULL
    `;

    if (!existingContact) {
      return Response.json({ error: "Contact not found" }, { status: 404 });
    }

    // If setting as primary, unset other primary contacts
    if (is_primary) {
      await sql`
        UPDATE company_contacts 
        SET is_primary = false, updated_at = CURRENT_TIMESTAMP, updated_by = ${userId}
        WHERE company_id = ${companyId} AND id != ${contactId} AND deleted_at IS NULL
      `;
    }

    const [updatedContact] = await sql`
      UPDATE company_contacts 
      SET 
        name = ${name},
        position = ${position},
        email = ${email},
        phone = ${phone},
        is_primary = ${is_primary || false},
        notes = ${notes},
        updated_by = ${userId}
      WHERE id = ${contactId} AND company_id = ${companyId}
      RETURNING *
    `;

    return Response.json({ contact: updatedContact });
  } catch (error) {
    console.error("Error updating contact:", error);
    return Response.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

// DELETE /api/companies/[id]/contacts/[contactId] - Delete a contact
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: companyId, contactId } = params;
    const userId = session.user.id;

    // Check if contact exists
    const [existingContact] = await sql`
      SELECT id FROM company_contacts 
      WHERE id = ${contactId} AND company_id = ${companyId} AND deleted_at IS NULL
    `;

    if (!existingContact) {
      return Response.json({ error: "Contact not found" }, { status: 404 });
    }

    // Soft delete the contact
    await sql`
      UPDATE company_contacts 
      SET deleted_at = CURRENT_TIMESTAMP, deleted_by = ${userId}
      WHERE id = ${contactId} AND company_id = ${companyId}
    `;

    return Response.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return Response.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}