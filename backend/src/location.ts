import { Hono } from "hono";
import sql from './db/db'
import { Component, Location as ItemLocation } from "./types"

const app = new Hono()

app.get('/', async c => {
    const locations = await sql`
        SELECT p.id AS position_id, p.name AS position, s.name AS storage_name, f.name AS facility FROM position p
        JOIN storage s on p.storage = s.id
        JOIN facility f ON s.facility = f.id
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

// app.post('/create', async c => {
//     const { location, type: loc_type } = await c.req.json();
//     switch (loc_type) {
//         case "facility":
//             await sql`INSERT INTO location (facility) VALUES (${location.facility});`
//             break;
//         case "storage":
//             await sql``
//             break;
//         case "position":
//             await sql``
//             break;
//     }
// })

export default app
