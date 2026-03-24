import { Hono } from "hono";
import sql from './db/db'

const app = new Hono()

app.get('/', async c => {
    const fields = c.req.query('fields');
    
    if (!fields) {
        return c.json(await sql`SELECT * FROM location`);
    }
    
    const columns = fields.split(',');
    return c.json(await sql`SELECT DISTINCT ${sql(columns)} FROM location`);
})

export default app
