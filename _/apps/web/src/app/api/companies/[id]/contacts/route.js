import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET /api/companies/[id]/contacts - Get all contacts for a company
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = params.id;

    const contacts = await sql`
      SELECT 
        cc.*,
        cb.name as created_by_name,
        ub.name as updated_by_name
      FROM company_contacts cc
      LEFT JOIN users cb ON cc.created_by = cb.id
      LEFT JOIN users ub ON cc.updated_by = ub.id
      WHERE cc.company_id = ${companyId}
      AND cc.deleted_at IS NULL
      ORDER BY cc.is_primary DESC, cc.created_at ASC
    `;

    return Response.json({ contacts });
  } catch (error) {
    console.error("Error fetching company contacts:", error);
    return Response.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

// POST /api/companies/[id]/contacts - Create a new contact for a company
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = params.id;
    const userId = session.user.id;
    const body = await request.json();
    const { name, position, email, phone, is_primary, notes } = body;

    // Validate required fields
    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    // If setting as primary, unset other primary contacts
    if (is_primary) {
      await sql`
        UPDATE company_contacts 
        SET is_primary = false, updated_at = CURRENT_TIMESTAMP, updated_by = ${userId}
        WHERE company_id = ${companyId} AND deleted_at IS NULL
      `;
    }

    const [contact] = await sql`
      INSERT INTO company_contacts (
        company_id, name, position, email, phone, is_primary, notes, created_by
      ) VALUES (
        ${companyId}, ${name}, ${position}, ${email}, ${phone}, ${is_primary || false}, ${notes}, ${userId}
      )
      RETURNING *
    `;

    return Response.json({ contact });
  } catch (error) {
    console.error("Error creating company contact:", error);
    return Response.json({ error: "Failed to create contact" }, { status: 500 });
  }
}