import { Hono } from 'hono'
import sql from './db/db'

const app = new Hono()

app.get('/', async c => {
    return c.json(await sql`SELECT * FROM project`)
})

export default app
