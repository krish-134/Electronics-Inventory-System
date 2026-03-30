import { Hono } from "hono";
import sql from './db/db'

const app = new Hono()

app.get('/', async c => {
    const fields = c.req.query('fields');
    const atr = c.req.query('atr');
    const op = c.req.query('op');
    const val = c.req.query('val');

    if (!fields) {
        return c.json(await sql`SELECT * FROM location`);
    }
    
    const columns = fields.split(',');
    
    // op doesn't work when inlined with sql() for some reason
    switch (op) {
        case "e":
            return c.json(await sql`SELECT DISTINCT ${sql(columns)} FROM location l NATURAL JOIN component c WHERE ${sql(`c.${atr}`)} = ${val}`);
        case "lt":
            return c.json(await sql`SELECT DISTINCT ${sql(columns)} FROM location l NATURAL JOIN component c WHERE ${sql(`c.${atr}`)} < ${val}`);
        case "lte":
            return c.json(await sql`SELECT DISTINCT ${sql(columns)} FROM location l NATURAL JOIN component c WHERE ${sql(`c.${atr}`)} <= ${val}`);
        case "gt":
            return c.json(await sql`SELECT DISTINCT ${sql(columns)} FROM location l NATURAL JOIN component c WHERE ${sql(`c.${atr}`)} > ${val}`);
        case "gte":
            return c.json(await sql`SELECT DISTINCT ${sql(columns)} FROM location l NATURAL JOIN component c WHERE ${sql(`c.${atr}`)} >= ${val}`);
        case "ne":
            return c.json(await sql`SELECT DISTINCT ${sql(columns)} FROM location l NATURAL JOIN component c WHERE ${sql(`c.${atr}`)} != ${val}`);
    }
})

export default app
