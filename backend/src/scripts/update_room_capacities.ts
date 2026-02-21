import { pool } from '../config/db';

// Helper to get capacity from room type: (BHK Count or 1) * (Sharing Count or 2)
const getCapacityFromType = (roomType: string): number => {
    if (!roomType) return 2; // Default
    const lower = roomType.toLowerCase();

    // 1. Determine Sharing Count
    let sharingCount = 2; // Default
    if (lower.includes('single')) sharingCount = 1;
    else if (lower.includes('double')) sharingCount = 2;
    else if (lower.includes('triple')) sharingCount = 3;
    else if (lower.includes('four')) sharingCount = 4;

    // 2. Determine BHK Count
    let bhkCount = 1; // Default
    const bhkMatch = lower.match(/(\d+)\s*bhk/);
    if (bhkMatch) {
        bhkCount = parseInt(bhkMatch[1], 10);
    } else if (lower.includes('studio')) {
        bhkCount = 1;
    }

    return bhkCount * sharingCount;
};

async function migrate() {
    console.log('🚀 Starting room capacity update...');
    const client = await pool.connect();
    try {
        const roomsRes = await client.query('SELECT id, room_type, room_number FROM rooms');
        console.log(`Found ${roomsRes.rows.length} rooms.`);

        for (const room of roomsRes.rows) {
            const capacity = getCapacityFromType(room.room_type);
            console.log(`Updating Room ${room.room_number}: Type "${room.room_type}" -> Capacity ${capacity}`);
            await client.query('UPDATE rooms SET capacity = $1 WHERE id = $2', [capacity, room.id]);
        }

        console.log('✅ Room capacities updated successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
