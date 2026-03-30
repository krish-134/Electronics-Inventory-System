import { Hono } from 'hono'
import sql from './db/db'

const app = new Hono()

app.get('/', async c => {
    return c.json(await sql`SELECT * FROM project`)
})

app.put('/:name/move', async c => {
    const { name } = c.req.param();
    const { position } = await c.req.json();
    if (position === undefined) return c.status(200);
    await sql`UPDATE project SET position = ${position} WHERE name = ${name}`;
    return c.json({ ok: true })
})

export default app
