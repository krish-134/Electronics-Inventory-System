import { Hono } from "hono";
import sql from './db/db'
import { Component, Location as ItemLocation } from "./types"

const app = new Hono()

app.get('/', async c => {
    return c.json(await sql`SELECT * FROM location`)
})

app.get('/components', async c => {
    const res: Result = await sql`SELECT c.part_num, t.storage_name, t.facility, t.position FROM (
        SELECT l.storage_name, l.facility, l.position, COUNT(*) FROM location l GROUP BY (l.storage_name, l.facility, l.position)
    ) t JOIN component c ON c.storage_name = t.storage_name AND c.facility = t.facility AND c.position = t.position`

    type ComponentWithLocation = ItemLocation & Pick<Component, "part_num">

    const locations = res as ComponentWithLocation[]

    const byFacility: {
        [facility: string]: {
            [storage_name: string]: ItemLocation[]
        }
    } = {};

    locations.forEach(loc => {
        const facilityMap: { [storage_name: string]: ItemLocation[] } = {};
        locations.forEach(loc2 => {
            if (loc.facility != loc2.facility) return;
            const key = loc2.label ?? loc2.storage_name;

            if (!facilityMap[key]) facilityMap[key] = []
            facilityMap[key]?.push(loc2)
        })
        byFacility[loc.facility] = facilityMap
    })

    return c.json(byFacility)
})

export default app
