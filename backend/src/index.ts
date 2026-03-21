import { Hono } from 'hono'
import sql from './db/db'
import 'dotenv/config'

import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(logger())
app.use(cors())

app.get('/', (c) => {
    (async () => {
        console.log(await sql`SELECT * FROM component FULL JOIN resistor ON component.part_num = resistor.part_num;`)
    })()

    return c.text('Hello Hono!')
})

app.get('/:table/all', async c => {
    const { table } = c.req.param()

    const res = await sql`SELECT * FROM ${sql(table)};`

    return c.json(res)
})

app.get('/components', async c => {
    const res = await sql`SELECT component.part_num, *,
        CASE
            WHEN capacitor.part_num = component.part_num THEN 'Capacitor'
            WHEN resistor.part_num = component.part_num THEN 'Resistor'
            WHEN diode.part_num = component.part_num THEN 'Diode'
            ELSE NULL END AS component_type
    FROM component
    LEFT JOIN capacitor USING (part_num)
    LEFT JOIN resistor USING (part_num)
    LEFT JOIN diode USING (part_num);`

    return c.json(res);
});

app.post('/component/create', async c => {
    const body = await c.req.json()

    const {
        part_num,
        price,
        name,
        package: pkg,
        tolerance,
        quantity,
        voltage_rating,
        additional,
        storage_name,
        position,
        facility,
        supplier_name
    } = body;

    await sql`INSERT INTO supplier (name, url, country) VALUES ('DigiKey', 'https://digikey.com', 'US') ON CONFLICT DO NOTHING;`

    await sql`INSERT INTO location (storage_name, position, facility) VALUES (${storage_name}, ${position}, ${facility}) ON CONFLICT DO NOTHING;`;

    await sql`
INSERT INTO component (
    part_num,
    price,
    name,
    package,
    tolerance,
    quantity,
    voltage_rating,
    additional,
    storage_name,
    position,
    facility,
    supplier_name
    ) VALUES (
    ${part_num},
    ${price},
    ${name},
    ${pkg},
    ${tolerance},
    ${quantity},
    ${voltage_rating},
    ${additional},
    ${storage_name},
    ${position},
    ${facility},
    ${supplier_name}
    );`

    return c.json(body, 200)
})

// temp endpoint to showcase database tuple edits
app.put('/component/:part_num/price', async (c) => {
    const { part_num } = c.req.param();
    const body = await c.req.json();

    await sql`
        UPDATE component 
        SET price = ${body.price} 
        WHERE part_num = ${part_num}
    `;

    return c.json(body, 200)
});

// Delete for tables with single-attribute keys
app.delete("/:table/:key", async (c) => {
    const { table, key } = c.req.param();

    const primaryKeys: Record<string, string> = {
        component:  'part_num',
        capacitor:  'part_num',
        resistor:   'part_num',
        diode:      'part_num',
        courier:    'name',
        supplier:   'name',
        project:    'name',
        purchase:   'order_number',
    }

    const primKey = primaryKeys[table]
    if (!primKey) {
        return c.json({ error: `Unknown table with no given Primary Key: "${table}`}, 400)
    }

    try {
        await sql`
            DELETE 
            FROM ${sql(table)}
            WHERE ${sql(primKey)} = ${key}
        `
    } catch (e: any) {
        if (e.code = '23503') {
            return c.json({ error: `Delete prevented: row information is referenced in another table`}, 409)
        }
        return c.json({ error: `Delete failed`}, 500)
    }

    return c.json( { deleted: key }, 200)
});

// Delete for tables with multiple-attribute priary keys
app.delete("/:table", async (c) => {
    const { table } = c.req.param();
    const body = await c.req.json();

    const primaryKeys: Record<string, string[]> = {
        location:          ['storage_name', 'position', 'facility'],
        includes:          ['project_name', 'component_part_num'],
        version:           ['project_name', 'version_number'],
        purchaseincludes:  ['order_number', 'part_num'],
        makes:             ['project_name', 'username'],
    }

    const primKeySet = primaryKeys[table]
    if (!primKeySet) {
        return c.json({ error: `Unknown table with no set of given Primary Key: "${table}`}, 400)
    }

    

    try {
        await sql`
            DELETE 
            FROM ${sql(table)}
            WHERE ${sql.and(primKeySet.map(primKey => sql`${sql(primKey)} = ${body[primKey]}`))}
        `
    } catch (e: any) {
        if (e.code = '23503') {
            return c.json({ error: `Delete prevented: row information is referenced in another table`}, 409)
        }
        return c.json({ error: `Delete failed`}, 500)
    }

    return c.json( { deleted: body }, 200)


})


export default app
