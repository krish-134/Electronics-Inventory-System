import { Hono } from "hono";
import sql from './db/db'
import { Component, Location as ItemLocation } from "./types"

const app = new Hono()

app.get('/', async c => {
    const locations = await sql`
        SELECT p.id AS position_id, p.name AS position, s.name AS storage_name, f.name AS facility
        FROM facility f
        LEFT JOIN storage s ON s.facility = f.id
        LEFT JOIN position p ON p.storage = s.id
        ORDER BY f.id, s.id, p.id
    `;

    return c.json(locations)
})

app.get('/components', async c => {
    const res = await sql`
        SELECT c.part_num,
            f.name AS facility_name,
            s.name AS storage_name,
            p.name AS position_name
        FROM component c
        JOIN position p ON c.position = p.id
        JOIN storage s ON p.storage = s.id
        JOIN facility f ON s.facility = f.id
        ORDER BY f.id, s.id, p.id
    `;

    const locations = res;

    const byFacility = locations.reduce((acc, loc) => {
        const { facility_name, storage_name, position_name, part_num } = loc;

        if (!acc[facility_name]) acc[facility_name] = {};
        if (!acc[facility_name][storage_name]) acc[facility_name][storage_name] = {};
        if (!acc[facility_name][storage_name][position_name]) {
            acc[facility_name][storage_name][position_name] = []
        }

        acc[facility_name][storage_name][position_name].push({
            part_num,
            facility: facility_name,
            storage_name,
            position: position_name
        })

        return acc
    }, {})

    return c.json(byFacility)
})

app.post('/create', async c => {
    const { location, type: loc_type } = await c.req.json();
    switch (loc_type) {
        case "facility":
            await sql`INSERT INTO facility (name) VALUES (${location.facility})`;
            break;
        case "storage": {
            const [{ id: facilityId }] = await sql`SELECT id FROM facility WHERE name = ${location.facility}`;
            await sql`INSERT INTO storage (name, facility) VALUES (${location.storage_name}, ${facilityId})`;
            break;
        }
        case "position": {
            const [{ id: storageId }] = await sql`
                SELECT s.id FROM storage s
                JOIN facility f ON s.facility = f.id
                WHERE s.name = ${location.storage_name} AND f.name = ${location.facility}
            `;
            await sql`INSERT INTO position (name, storage) VALUES (${location.position}, ${storageId})`;
            break;
        }
    }
    return c.json({ ok: true })
})

app.put('/rename', async c => {
    const { type: loc_type, oldName, newName, facility, storage } = await c.req.json();
    switch (loc_type) {
        case "facility":
            await sql`UPDATE facility SET name = ${newName} WHERE name = ${oldName}`;
            break;
        case "storage": {
            const [{ id: facilityId }] = await sql`SELECT id FROM facility WHERE name = ${facility}`;
            await sql`UPDATE storage SET name = ${newName} WHERE name = ${oldName} AND facility = ${facilityId}`;
            break;
        }
        case "position": {
            const [{ id: storageId }] = await sql`
                SELECT s.id FROM storage s
                JOIN facility f ON s.facility = f.id
                WHERE s.name = ${storage} AND f.name = ${facility}
            `;
            await sql`UPDATE position SET name = ${newName} WHERE name = ${oldName} AND storage = ${storageId}`;
            break;
        }
    }
    return c.json({ ok: true })
})

app.get('/unplaced', async c => {
    const res = await sql`
        SELECT part_num, name, quantity, supplier_name
        FROM component WHERE position IS NULL
        ORDER BY part_num
    `;
    return c.json(res)
})

export default app
