import { Hono } from 'hono'
import sql from './db/db'

const app = new Hono()

app.get('/', async c => {
    const division = c.req.query('has-all-components');

    if (!division) return c.json(await sql`SELECT * FROM project`);

    return c.json(await sql`SELECT name, purpose FROM project p WHERE NOT EXISTS ((SELECT c.part_num FROM component c) EXCEPT (SELECT i.component_part_num FROM includes i WHERE p.name = i.project_name))`);
})



export default app
