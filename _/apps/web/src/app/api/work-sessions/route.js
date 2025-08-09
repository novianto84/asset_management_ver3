import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get work sessions
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const unitId = url.searchParams.get("unit_id");
    const teknisiId = url.searchParams.get("teknisi_id");
    const active = url.searchParams.get("active") === "true";
    const limit = parseInt(url.searchParams.get("limit")) || 20;

    if (active && unitId && teknisiId) {
      // Find active sessions - work_start sessions without corresponding work_end
      const activeSessions = await sql`
        SELECT 
          ws.*,
          u.unit_name,
          u.model,
          user_teknisi.name as teknisi_name
        FROM work_sessions ws
        LEFT JOIN units u ON ws.unit_id = u.id
        LEFT JOIN users user_teknisi ON ws.teknisi_id = user_teknisi.id
        WHERE ws.unit_id = ${unitId} 
          AND ws.teknisi_id = ${teknisiId}
          AND ws.session_type = 'work_start'
          AND NOT EXISTS (
            SELECT 1 FROM work_sessions ws2 
            WHERE ws2.unit_id = ws.unit_id 
              AND ws2.teknisi_id = ws.teknisi_id
              AND ws2.session_type = 'work_end'
              AND ws2.scan_time > ws.scan_time
          )
        ORDER BY ws.scan_time DESC
        LIMIT 1
      `;

      return Response.json({ sessions: activeSessions });
    }

    let query = `
      SELECT 
        ws.*,
        u.unit_name,
        u.model,
        user_teknisi.name as teknisi_name
      FROM work_sessions ws
      LEFT JOIN units u ON ws.unit_id = u.id
      LEFT JOIN users user_teknisi ON ws.teknisi_id = user_teknisi.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (unitId) {
      paramCount++;
      query += ` AND ws.unit_id = $${paramCount}`;
      params.push(unitId);
    }

    if (teknisiId) {
      paramCount++;
      query += ` AND ws.teknisi_id = $${paramCount}`;
      params.push(teknisiId);
    }

    query += ` ORDER BY ws.scan_time DESC`;

    if (limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);
    }

    const sessions = await sql(query, params);

    return Response.json({ sessions });
  } catch (error) {
    console.error("Error fetching work sessions:", error);
    return Response.json(
      { error: "Failed to fetch work sessions" },
      { status: 500 },
    );
  }
}

// Create new work session (QR scan)
export async function POST(request) {
  try {
    const session = await auth();
    const data = await request.json();

    // Verify user is authenticated and is a teknisi
    if (!session?.user?.id) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user role from database
    const [user] = await sql`
      SELECT role FROM users WHERE id = ${session.user.id}
    `;

    if (!user || user.role !== "teknisi") {
      return Response.json(
        { error: "Only teknisi can create work sessions" },
        { status: 403 },
      );
    }

    const result = await sql`
      INSERT INTO work_sessions (
        unit_id, teknisi_id, session_type, 
        gps_latitude, gps_longitude, notes
      ) VALUES (${data.unit_id}, ${data.teknisi_id}, ${data.session_type || "work_start"}, 
        ${data.gps_latitude}, ${data.gps_longitude}, ${data.notes})
      RETURNING *
    `;

    return Response.json({ session: result[0] });
  } catch (error) {
    console.error("Error creating work session:", error);
    return Response.json(
      { error: "Failed to create work session" },
      { status: 500 },
    );
  }
}
