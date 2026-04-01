import { Hono } from "hono";
import sql from './db/db'

const app = new Hono()

app.get('/', async c => {
    const { type } = c.req.query();

    const res = await sql`SELECT * FROM (
        SELECT component.*,
        p.name AS position_name, s.name AS storage_name, f.name AS facility,
        resistor.resistance, resistor.power, resistor.composition,
        capacitor.capacitance, capacitor.type, capacitor.temp_coeff,
        diode.vforward, diode.vreverse, diode.dcapacitance,
        CASE
            WHEN capacitor.part_num IS NOT NULL THEN 'capacitor'
            WHEN resistor.part_num IS NOT NULL THEN 'resistor'
            WHEN diode.part_num IS NOT NULL THEN 'diode'
            ELSE NULL END AS component_type
    FROM component
    LEFT JOIN capacitor USING (part_num)
    LEFT JOIN resistor USING (part_num)
    LEFT JOIN diode USING (part_num)
    LEFT JOIN position p ON component.position = p.id
    LEFT JOIN storage s ON p.storage = s.id
    LEFT JOIN facility f ON s.facility = f.id) sub
    WHERE (${type ?? null}::text IS NULL OR component_type = ${type ?? null});`

    return c.json(res);
});

app.post('/:component_type', async c => {
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
        position,
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
    position,
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
    ${position ?? null},
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
            INSERT INTO diode (part_num, vforward, vreverse, dcapacitance) VALUES (${part_num}, ${vforward}, ${vreverse}, ${capacitance ?? null});
            `
            break
    }

    return c.json(body, 200)
})

app.put('/:part_num', async c => {
    const { part_num } = c.req.param();
    const body = await c.req.json()
    console.log(part_num, body)

    const {
        part_num: new_part_num,
        price,
        name,
        package: pkg,
        tolerance,
        quantity,
        voltage_rating,
        additional,
        position,
        supplier_name
    } = body;

    await sql`
UPDATE component SET
    part_num = ${new_part_num},
    price = ${price ?? null},
    name = ${name},
    package = ${pkg ?? null},
    tolerance = ${tolerance ?? null},
    quantity = ${quantity ?? null},
    voltage_rating = ${voltage_rating ?? null},
    additional = ${additional ?? null},
    position = ${position ?? null},
    supplier_name = ${supplier_name ?? null}
WHERE part_num = ${part_num};`




    // const { power, resistance, composition } = body
    // await sql`
    // UPDATE resistor SET power=${power ?? null}, resistance=${resistance}, composition=${composition ?? null} WHERE part_num=${new_part_num};
    // `

    // const { type: res_type, capacitance, temp_coeff } = body
    // await sql`
    // UPDATE capacitor SET type=${res_type ?? null}, temp_coeff=${temp_coeff ?? null}, capacitance=${capacitance} WHERE part_num=${new_part_num};
    // `

    // const { vforward, vreverse, capacitance: diode_capacitance } = body
    // await sql`
    // UPDATE diode SET vforward=${vforward}, vreverse=${vreverse}, dcapacitance=${diode_capacitance ?? null} WHERE part_num=${new_part_num};
    // `

    const component_type = body
    switch (component_type) {
        case "resistor":
            const { power, resistance, composition } = body
            await sql`
        UPDATE resistor SET power=${power ?? null}, resistance=${resistance}, composition=${composition ?? null} WHERE part_num=${new_part_num};
        `
        case "capacitor":
            const { type: res_type, capacitance, temp_coeff } = body
            await sql`
            UPDATE capacitor SET type=${res_type ?? null}, temp_coeff=${temp_coeff ?? null}, capacitance=${capacitance} WHERE part_num=${new_part_num};
            `
        case "diode":
            const { vforward, vreverse, capacitance: diode_capacitance } = body
            await sql`
            UPDATE diode SET vforward=${vforward}, vreverse=${vreverse}, dcapacitance=${diode_capacitance ?? null} WHERE part_num=${new_part_num};
            `
    }    
    

    return c.json(part_num, 200)
})

app.delete("/:part_num", async (c) => {
    const { part_num } = c.req.param();

    try {
        await sql`
            DELETE 
            FROM component
            WHERE part_num = ${part_num}
        `;
        return c.json(part_num, 200)
    } catch (e: any) {
        if (e.code === '23503') {
            return c.json({ error: `Cannot delete ${part_num} - it is still referenced by a purchase order` }, 409)
        }
        return c.json({ error: e.message }, 500 )
    }

})

app.put("/:part_num/move", async c => {
    const { part_num } = c.req.param();
    const body = await c.req.json();

    const {
        position
    } = body

    if (position === undefined) return c.status(200)

    const res = await sql`UPDATE component SET position=${position} WHERE part_num=${part_num};`

    return c.json(res, 200)
})

export default app
