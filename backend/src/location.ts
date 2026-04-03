import { Hono } from "hono";
import sql from './db/db'
import { Component, Location as ItemLocation } from "./types"

const app = new Hono()

app.get('/', async c => {
    const fields = c.req.query('fields');
    const atr = c.req.query('atr');
    const op = c.req.query('op');
    const val = c.req.query('val');

    if (!fields) {
        const locations = await sql`
            SELECT p.id AS position_id, p.name AS position, s.name AS storage_name, f.name AS facility
            FROM facility f
            LEFT JOIN storage s ON s.facility = f.id
            LEFT JOIN position p ON p.storage = s.id
            ORDER BY f.id, s.id, p.id
        `;
        return c.json(locations)
    }

    const columns = fields.split(',');
    const base = sql`(
        SELECT c.part_num, c.price, c.name, c.package, c.tolerance, c.quantity,
               c.voltage_rating, c.additional, c.supplier_name,
               p.name AS position, s.name AS storage_name, f.name AS facility
        FROM component c
        JOIN position p ON c.position = p.id
        JOIN storage s ON p.storage = s.id
        JOIN facility f ON s.facility = f.id
    ) AS loc`;

    // op doesn't work when inlined with sql() for some reason
    switch (op) {
        case "e":
            return c.json(await sql`SELECT DISTINCT ${sql(columns)} FROM ${base} WHERE ${sql(atr)} = ${val}`);
        case "lt":
            return c.json(await sql`SELECT DISTINCT ${sql(columns)} FROM ${base} WHERE ${sql(atr)} < ${val}`);
        case "lte":
            return c.json(await sql`SELECT DISTINCT ${sql(columns)} FROM ${base} WHERE ${sql(atr)} <= ${val}`);
        case "gt":
            return c.json(await sql`SELECT DISTINCT ${sql(columns)} FROM ${base} WHERE ${sql(atr)} > ${val}`);
        case "gte":
            return c.json(await sql`SELECT DISTINCT ${sql(columns)} FROM ${base} WHERE ${sql(atr)} >= ${val}`);
        case "ne":
            return c.json(await sql`SELECT DISTINCT ${sql(columns)} FROM ${base} WHERE ${sql(atr)} != ${val}`);
    }

    return c.json([])
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
    try {
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
    } catch (e: any) {
        if (e.code === '23505') {
            return c.json({ error: "Use your newly created one first!" }, 409);
        }

        return c.json({ error: "Something went wrong" }, 500);
    }
    return c.json({ ok: true })
})

app.put('/rename', async c => {
    const { type: loc_type, oldName, newName, facility, storage } = await c.req.json();
    try {
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
    } catch (e: any) {
        if (e.code === '23505') {
            return c.json({ error: "Please use unique location names!" }, 409);
        }

        return c.json({ error: "Something went wrong" }, 500);
    }
    return c.json({ ok: true })
})

app.delete('/delete', async c => {
    const { location, type: loc_type } = await c.req.json();
    switch (loc_type) {
        case "facility": {
            const [{ id: facilityId }] = await sql`SELECT id FROM facility WHERE name = ${location.facility}`;
            await sql`DELETE FROM position WHERE storage IN (SELECT id FROM storage WHERE facility = ${facilityId})`;
            await sql`DELETE FROM storage WHERE facility = ${facilityId}`;
            await sql`DELETE FROM facility WHERE id = ${facilityId}`;
            break;
        }
        case "storage": {
            const [{ id: facilityId }] = await sql`SELECT id FROM facility WHERE name = ${location.facility}`;
            const [{ id: storageId }] = await sql`SELECT id FROM storage WHERE name = ${location.storage_name} AND facility = ${facilityId}`;
            await sql`DELETE FROM position WHERE storage = ${storageId}`;
            await sql`DELETE FROM storage WHERE id = ${storageId}`;
            break;
        }
        case "position": {
            const [{ id: storageId }] = await sql`
                SELECT s.id FROM storage s
                JOIN facility f ON s.facility = f.id
                WHERE s.name = ${location.storage_name} AND f.name = ${location.facility}
            `;
            await sql`DELETE FROM position WHERE name = ${location.position} AND storage = ${storageId}`;
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

app.get('/projects', async c => {
    const res = await sql`
        SELECT proj.name AS project_name,
            f.name AS facility_name,
            s.name AS storage_name,
            pos.name AS position_name
        FROM project proj
        JOIN position pos ON proj.position = pos.id
        JOIN storage s ON pos.storage = s.id
        JOIN facility f ON s.facility = f.id
        ORDER BY f.id, s.id, pos.id
    `;

    const byFacility = res.reduce((acc, row) => {
        const { facility_name, storage_name, position_name, project_name } = row;
        acc[facility_name] ??= {};
        acc[facility_name][storage_name] ??= {};
        acc[facility_name][storage_name][position_name] ??= [];
        acc[facility_name][storage_name][position_name].push({ project_name });
        return acc;
    }, {})

    return c.json(byFacility)
})

app.get('/unplaced-projects', async c => {
    const res = await sql`
        SELECT name FROM project WHERE position IS NULL ORDER BY name
    `;
    return c.json(res)
})

export default app
