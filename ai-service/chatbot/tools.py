"""Custom LangChain tools that query the hostel database."""
import psycopg2
from datetime import datetime, timedelta
from langchain.tools import tool
from config import DATABASE_URL

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def resolve_day(day_input: str) -> int:
    """Resolve a day input (relative or absolute) to a day_of_week number (0=Sun, 6=Sat)."""
    day_lower = day_input.strip().lower()
    now = datetime.now()
    
    # Relative day mapping
    relative_map = {
        'today': 0,
        'tomorrow': 1,
        'day after tomorrow': 2,
        'day after': 2,
        'yesterday': -1,
        'day before yesterday': -2,
    }
    
    if day_lower in relative_map:
        target = now + timedelta(days=relative_map[day_lower])
        # Python weekday: Mon=0, Sun=6 -> convert to DB format Sun=0, Sat=6
        py_dow = target.weekday()
        return (py_dow + 1) % 7
    
    # Absolute day names
    day_name_map = {'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6}
    if day_lower in day_name_map:
        return day_name_map[day_lower]
    
    return None

@tool
def get_mess_menu(day: str = "today") -> str:
    """Get the mess/dining menu for a specific day. 
    Accepts: 'today', 'tomorrow', 'day after tomorrow', 'yesterday', or any day name like 'monday', 'tuesday', etc.
    Use this when a student asks about food, meals, or the menu."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        dow = resolve_day(day)
        if dow is not None:
            day_filter = "day_of_week = %s"
            params = [dow]
        else:
            day_filter = "1=1"
            params = []
        
        cur.execute(f"""
            SELECT day_of_week, meal_type, menu, timings
            FROM mess_schedule
            WHERE {day_filter}
            ORDER BY day_of_week, 
            CASE meal_type 
                WHEN 'breakfast' THEN 1 
                WHEN 'lunch' THEN 2 
                WHEN 'snacks' THEN 3 
                WHEN 'dinner' THEN 4 
                ELSE 5
            END
        """, tuple(params))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        if not rows:
            return "No mess menu data found for that request."

        day_names = {0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'}
        
        # Group by day
        from collections import defaultdict
        menu_by_day = defaultdict(list)
        for row in rows:
            d_name = day_names.get(row[0], str(row[0]))
            menu_by_day[d_name].append((row[1], row[2], row[3]))
            
        import json

        result = "📋 Mess Menu:\n"
        for d_name, meals in menu_by_day.items():
            result += f"\n🗓️ {d_name}:\n"
            for m_type, m_menu, m_time in meals:
                # m_menu is often stored as JSON like [{"dish": "Sushi", "type": "veg"}]
                parsed_menu = m_menu
                try:
                    items = json.loads(m_menu)
                    if isinstance(items, list):
                        dish_names = [item.get("dish", "") for item in items if isinstance(item, dict) and "dish" in item]
                        if dish_names:
                            parsed_menu = ", ".join(dish_names)
                except Exception:
                    pass # Not JSON or weird format, keep it as string
                    
                time_str = f" ({m_time})" if m_time else ""
                icon = "🌅" if m_type == "breakfast" else "🌞" if m_type == "lunch" else "🫖" if m_type == "snacks" else "🌙" if m_type == "dinner" else "🍽️"
                result += f"  {icon} {m_type.capitalize()}: {parsed_menu}{time_str}\n"
        
        return result
    except Exception as e:
        return f"Could not fetch menu: {str(e)}"

@tool
def get_student_info(student_id: int) -> str:
    """Get a student's room, fee dues, and status information.
    Use this when the student asks about their room, fees, or account status."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT s.roll_no, u.full_name, s.dues, s.status,
                   r.room_number, r.room_type
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN room_allocations ra ON s.id = ra.student_id AND ra.is_active = true
            LEFT JOIN rooms r ON ra.room_id = r.id
            WHERE s.id = %s
        """, (student_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            return "Student not found."

        return (
            f"👤 {row[1]} (Roll: {row[0]})\n"
            f"🏠 Room: {row[4] or 'Not assigned'} ({row[5] or 'N/A'})\n"
            f"💰 Dues: ₹{row[2] or 0}\n"
            f"📌 Status: {row[3]}"
        )
    except Exception as e:
        return f"Could not fetch student info: {str(e)}"

@tool
def get_complaint_status(student_id: int) -> str:
    """Get the status of a student's recent complaints/service requests.
    Use when student asks about their complaint or service request status."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT title, description, status, created_at
            FROM complaints
            WHERE student_id = %s
            ORDER BY created_at DESC
            LIMIT 5
        """, (student_id,))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        if not rows:
            return "No complaints found."

        result = "📝 Recent Complaints:\n"
        for row in rows:
            status_emoji = {"pending": "🟡", "in_progress": "🔵", "resolved": "✅"}.get(row[2], "⚪")
            result += f"\n{status_emoji} {row[0]}\n   Status: {row[2]} | Filed: {row[3].strftime('%d %b %Y')}\n"
        return result
    except Exception as e:
        return f"Could not fetch complaints: {str(e)}"

@tool
def get_bus_routes() -> str:
    """Get bus route information and schedules.
    Use when a student asks about bus timings or routes."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT route_name, destination, departure_time, message, schedule_type, valid_date
            FROM bus_timings
            WHERE is_active = true
            ORDER BY departure_time
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        if not rows:
            return "No bus routes active right now."

        result = "🚌 Bus Routes:\n"
        for row in rows:
            route_name = row[0]
            destination = row[1] or "N/A"
            dep_time = str(row[2])
            message = row[3] or ""
            sch_type = row[4] or "everyday"
            valid_date = row[5]
            
            date_str = valid_date.strftime('%d %b %Y') if valid_date else None
            
            result += f"\n🛣️ {route_name} → {destination}\n"
            if sch_type.lower() == 'once' and date_str:
                result += f"   📅 Date: {date_str}\n"
            else:
                result += f"   📅 Schedule: {sch_type.capitalize()}\n"
            result += f"   ⏰ Departure: {dep_time}\n"
            if message:
                result += f"   ℹ️ Note: {message}\n"
        return result
    except Exception as e:
        return f"Could not fetch bus routes: {str(e)}"

@tool
def get_laundry_info() -> str:
    """Get laundry service information including allowed days, pickup/delivery schedule, and max items.
    Use when a student asks about laundry timings, laundry days, or laundry service details."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT max_items_per_request, allowed_days, pickup_schedule, delivery_schedule, is_active
            FROM laundry_settings
            LIMIT 1
        """)
        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            return "No laundry settings configured yet."

        max_items = row[0] or 10
        allowed_days = row[1] or []
        pickup = row[2] or "Not specified"
        delivery = row[3] or "Not specified"
        is_active = row[4]

        status = "✅ Active" if is_active else "❌ Currently Inactive"
        days_str = ", ".join(allowed_days) if allowed_days else "Not specified"

        result = f"🧺 Laundry Service Info:\n"
        result += f"   📌 Status: {status}\n"
        result += f"   📅 Allowed Days: {days_str}\n"
        result += f"   📦 Max Items per Request: {max_items}\n"
        result += f"   🚚 Pickup: {pickup}\n"
        result += f"   📬 Delivery: {delivery}\n"
        return result
    except Exception as e:
        return f"Could not fetch laundry info: {str(e)}"

@tool
def log_complaint(student_id: int, title: str, description: str, category: str = "general") -> str:
    """Log a new complaint for a student.
    Use this when a student wants to report an issue or file a complaint."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO complaints (student_id, title, description, category, status)
            VALUES (%s, %s, %s, %s, 'pending')
            RETURNING id
        """, (student_id, title, description, category))
        complaint_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return f"✅ Complaint logged successfully! Your Complaint ID is #{complaint_id}. The admin will review it soon."
    except Exception as e:
        return f"❌ Failed to log complaint: {str(e)}"

@tool
def apply_for_leave(student_id: int, start_date: str, end_date: str, reason: str) -> str:
    """Apply for a leave of absence.
    Dates should be in YYYY-MM-DD format.
    Use this AFTER the student has confirmed the details."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO leave_requests (student_id, start_date, end_date, reason, status)
            VALUES (%s, %s, %s, %s, 'pending')
            RETURNING id
        """, (student_id, start_date, end_date, reason))
        leave_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return f"✅ Leave request submitted successfully! Request ID: #{leave_id}. You can check the status later."
    except Exception as e:
        return f"❌ Failed to submit leave request: {str(e)}"

@tool
def register_visitor(
    student_id: int, 
    visitor_name: str, 
    visitor_phone: str, 
    visitor_relation: str, 
    purpose: str, 
    expected_date: str, 
    expected_time_in: str, 
    expected_time_out: str = None, 
    room_number: str = None
) -> str:
    """Register a visitor request.
    expected_date should be YYYY-MM-DD. expected_time_in/out should be HH:MM.
    If room_number is not provided, it will be fetched automatically."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Auto-fetch room number if not provided
        if not room_number:
            cur.execute("""
                SELECT r.room_number 
                FROM rooms r
                JOIN room_allocations ra ON r.id = ra.room_id
                WHERE ra.student_id = %s AND ra.is_active = true
            """, (student_id,))
            row = cur.fetchone()
            if row:
                room_number = row[0]
            else:
                return "❌ Error: Could not find your room number automatically. Please specify your room number."

        cur.execute("""
            INSERT INTO visitors (
                student_id, visitor_name, visitor_phone, visitor_relation, 
                purpose, room_number, expected_date, expected_time_in, expected_time_out, status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
            RETURNING id
        """, (
            student_id, visitor_name, visitor_phone, visitor_relation, 
            purpose, room_number, expected_date, expected_time_in, expected_time_out
        ))
        visitor_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return f"✅ Visitor request registered successfully! Request ID: #{visitor_id}. Please ensure the visitor carries a valid ID."
    except Exception as e:
        return f"❌ Failed to register visitor: {str(e)}"

# List of all tools for the agent
ALL_TOOLS = [
    get_mess_menu, 
    get_student_info, 
    get_complaint_status, 
    get_bus_routes, 
    get_laundry_info,
    log_complaint,
    apply_for_leave,
    register_visitor
]
