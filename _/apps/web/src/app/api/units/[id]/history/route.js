import sql from "@/app/api/utils/sql";

// Get unit history (work history, access logs, maintenance, parts replacement)
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // 'all', 'work', 'access', 'maintenance', 'parts'
    const limit = parseInt(url.searchParams.get("limit")) || 50;

    let histories = [];

    // Get work history
    if (!type || type === 'all' || type === 'work') {
      const workHistory = await sql(`
        SELECT 
          'work' as type,
          wh.id,
          wh.work_date as date,
          wh.description,
          wh.photos,
          wh.videos,
          wh.gps_latitude,
          wh.gps_longitude,
          wh.work_duration_minutes,
          u.name as technician_name,
          t.title as task_title,
          t.task_type,
          t.priority,
          a.assignment_id
        FROM work_history wh
        LEFT JOIN users u ON wh.teknisi_id = u.id
        LEFT JOIN tasks t ON wh.task_id = t.id
        LEFT JOIN assignments a ON wh.assignment_id = a.id
        WHERE wh.unit_id = $1
        ORDER BY wh.work_date DESC
        LIMIT $2
      `, [id, limit]);
      
      histories = [...histories, ...workHistory];
    }

    // Get access logs
    if (!type || type === 'all' || type === 'access') {
      const accessLogs = await sql(`
        SELECT 
          'access' as type,
          ual.id,
          ual.accessed_at as date,
          ual.access_type,
          ual.ip_address,
          ual.user_agent,
          'Unit accessed via ' || ual.access_type as description
        FROM unit_access_logs ual
        WHERE ual.unit_id = $1
        ORDER BY ual.accessed_at DESC
        LIMIT $2
      `, [id, limit]);
      
      histories = [...histories, ...accessLogs];
    }

    // Get maintenance schedules and completed maintenance
    if (!type || type === 'all' || type === 'maintenance') {
      const maintenance = await sql(`
        SELECT 
          'maintenance' as type,
          ms.id,
          COALESCE(ms.last_done, ms.next_due) as date,
          ms.maintenance_type || ' - ' || COALESCE(ms.description, 'Scheduled maintenance') as description,
          ms.frequency_days,
          ms.last_done,
          ms.next_due,
          ms.is_active,
          CASE 
            WHEN ms.last_done IS NOT NULL THEN 'completed'
            WHEN ms.next_due < CURRENT_DATE THEN 'overdue'
            WHEN ms.next_due <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
            ELSE 'scheduled'
          END as maintenance_status
        FROM maintenance_schedules ms
        WHERE ms.unit_id = $1
        ORDER BY COALESCE(ms.last_done, ms.next_due) DESC
        LIMIT $2
      `, [id, limit]);
      
      histories = [...histories, ...maintenance];
    }

    // Get parts replacement history
    if (!type || type === 'all' || type === 'parts') {
      const partsHistory = await sql(`
        SELECT 
          'parts' as type,
          pr.id,
          pr.replacement_date as date,
          'Replaced ' || pi.part_name || ' (Qty: ' || pr.quantity_used || ')' as description,
          pr.quantity_used,
          pr.next_replacement_due,
          pr.part_condition_before,
          pr.replacement_reason,
          pr.warranty_months,
          pi.part_name,
          pi.part_code,
          pi.category as part_category,
          wh.description as work_description,
          u.name as technician_name
        FROM parts_replacement pr
        LEFT JOIN parts_inventory pi ON pr.part_id = pi.id
        LEFT JOIN work_history wh ON pr.work_history_id = wh.id
        LEFT JOIN users u ON wh.teknisi_id = u.id
        WHERE pr.unit_id = $1
        ORDER BY pr.replacement_date DESC
        LIMIT $2
      `, [id, limit]);
      
      histories = [...histories, ...partsHistory];
    }

    // Get work sessions (QR code scans, work start/end)
    if (!type || type === 'all' || type === 'sessions') {
      const workSessions = await sql(`
        SELECT 
          'session' as type,
          ws.id,
          ws.scan_time as date,
          'Work session: ' || ws.session_type || COALESCE(' - ' || ws.notes, '') as description,
          ws.session_type,
          ws.gps_latitude,
          ws.gps_longitude,
          ws.notes,
          u.name as technician_name
        FROM work_sessions ws
        LEFT JOIN users u ON ws.teknisi_id = u.id
        WHERE ws.unit_id = $1
        ORDER BY ws.scan_time DESC
        LIMIT $2
      `, [id, limit]);
      
      histories = [...histories, ...workSessions];
    }

    // Sort all histories by date
    histories.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limit final results
    histories = histories.slice(0, limit);

    return Response.json({ 
      histories,
      total: histories.length,
      unit_id: parseInt(id)
    });
  } catch (error) {
    console.error("Error fetching unit history:", error);
    return Response.json({ error: "Failed to fetch unit history" }, { status: 500 });
  }
}