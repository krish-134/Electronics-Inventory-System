import { Hono } from "hono";
import sql from './db/db'

const app = new Hono()

app.get('/', async c => {
    return c.json(await sql`SELECT * FROM component`)
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

app.post('/component/:component_type', async c => {
    const { component_type } = c.req.param()
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
    ${price ?? null},
    ${name},
    ${pkg ?? null},
    ${tolerance ?? null},
    ${quantity ?? null},
    ${voltage_rating ?? null},
    ${additional ?? null},
    ${storage_name ?? null},
    ${position ?? null},
    ${facility ?? null},
    ${supplier_name}
    );`

    switch (component_type) {
        case "resistor":
            const { power, resistance, composition } = body
            await sql`
            INSERT INTO resistor (part_num, power, resistance, composition) VALUES (${part_num}, ${power ?? null}, ${resistance}, ${composition ?? null});
            `
            break
        case "capacitor": {
            const { type: res_type, capacitance, temp_coeff } = body
            await sql`
            INSERT INTO capacitor (part_num, type, temp_coeff, capacitance) VALUES (${part_num}, ${res_type ?? null}, ${temp_coeff ?? null}, ${capacitance});
            `
            break
        }
        case "diode":
            const { vforward, vreverse, capacitance } = body
            await sql`
            INSERT INTO diode (part_num, vforward, vreverse, capacitance) VALUES (${part_num}, ${vforward}, ${vreverse}, ${capacitance ?? null});
            `
            break
    }

    return c.json(body, 200)
})

app.delete("/:part_num", async (c) => {
    const { part_num } = c.req.param();

    await sql`
        DELETE 
        FROM component
        WHERE part_num = ${part_num}
    `;

    return c.json(part_num, 200)
})

export default app
