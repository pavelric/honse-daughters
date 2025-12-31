import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import getDatabase, { Database as DB } from "../../data";

type RowsQuery = {
  limit?: string;
  offset?: string;
};

type PatchBody = {
  key: Record<string, unknown>;
  update: Record<string, unknown>;
};

type InsertBody = {
  values: Record<string, unknown>;
};

type DeleteBody = {
  key: Record<string, unknown>;
};

function getTables(db: ReturnType<typeof getDatabase>): string[] {
  const stmt = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );
  const rows = stmt.all() as { name: string }[];
  return rows.map((r) => r.name);
}

function getSchema(
  db: ReturnType<typeof getDatabase>,
  table: string
): {
  columns: {
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: unknown;
    pk: number;
  }[];
  primaryKey: string[];
} {
  const info = db.prepare(`PRAGMA table_info(${escapeIdent(table)})`).all() as {
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: unknown;
    pk: number;
  }[];
  const pk = info.filter((c) => c.pk > 0).sort((a, b) => a.pk - b.pk).map((c) => c.name);
  return { columns: info, primaryKey: pk };
}

function escapeIdent(ident: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(ident)) {
    throw new Error("Invalid identifier");
  }
  return `"${ident}"`;
}

function validateTable(db: ReturnType<typeof getDatabase>, table: string): void {
  const names = getTables(db);
  if (!names.includes(table)) {
    throw new Error("Unknown table");
  }
}

export default async function routes(fastify: FastifyInstance) {
  const db = getDatabase(DB.HONSE_DATA);

  fastify.get("/db/tables", async (_req: FastifyRequest, reply: FastifyReply) => {
    const tables = getTables(db);
    reply.send({ tables });
  });

  fastify.get(
    "/db/table/:name/schema",
    async (req: FastifyRequest<{ Params: { name: string } }>, reply: FastifyReply) => {
      const name = req.params.name;
      validateTable(db, name);
      const schema = getSchema(db, name);
      reply.send(schema);
    }
  );

  fastify.get(
    "/db/table/:name/rows",
    async (
      req: FastifyRequest<{ Params: { name: string }; Querystring: RowsQuery }>,
      reply: FastifyReply
    ) => {
      const name = req.params.name;
      validateTable(db, name);
      const { primaryKey, columns } = getSchema(db, name);
      const limit = Math.min(Math.max(parseInt(req.query.limit || "100", 10) || 100, 1), 1000);
      const offset = Math.max(parseInt(req.query.offset || "0", 10) || 0, 0);
      const orderBy =
        primaryKey.length > 0
          ? primaryKey.map((c) => `${escapeIdent(c)} ASC`).join(", ")
          : "rowid ASC";
      const selectCols =
        primaryKey.length > 0 ? "*" : "rowid as __rowid__, *";
      const sql = `SELECT ${selectCols} FROM ${escapeIdent(name)} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
      const rows = db.prepare(sql).all(limit, offset);
      const total = (db.prepare(`SELECT COUNT(*) as c FROM ${escapeIdent(name)}`).get() as {
        c: number;
      }).c;
      reply.send({
        primaryKey,
        columns: columns.map((c) => c.name),
        total,
        limit,
        offset,
        rows,
      });
    }
  );

  fastify.patch(
    "/db/table/:name/row",
    async (
      req: FastifyRequest<{ Params: { name: string }; Body: PatchBody }>,
      reply: FastifyReply
    ) => {
      const name = req.params.name;
      validateTable(db, name);
      const schema = getSchema(db, name);
      const cols = new Set(schema.columns.map((c) => c.name));
      for (const k of Object.keys(req.body.update)) {
        if (!cols.has(k)) {
          return reply.status(400).send({ error: "Invalid column" });
        }
      }
      const keyCols =
        schema.primaryKey.length > 0 ? schema.primaryKey : ["__rowid__"];
      for (const k of keyCols) {
        if (!(k in req.body.key)) {
          return reply.status(400).send({ error: "Missing key" });
        }
      }
      const setClause = Object.keys(req.body.update)
        .map((c) => `${escapeIdent(c)} = @u_${c}`)
        .join(", ");
      if (!setClause) {
        return reply.status(400).send({ error: "No updates" });
      }
      const whereClause = keyCols
        .map((c) => `${c === "__rowid__" ? "rowid" : escapeIdent(c)} = @k_${c}`)
        .join(" AND ");
      const sql = `UPDATE ${escapeIdent(name)} SET ${setClause} WHERE ${whereClause}`;
      const params: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(req.body.update)) params[`u_${k}`] = v;
      for (const [k, v] of Object.entries(req.body.key)) params[`k_${k}`] = v;
      const info = db.prepare(sql).run(params);
      reply.send({ ok: true, changes: info.changes });
    }
  );

  fastify.post(
    "/db/table/:name/row",
    async (
      req: FastifyRequest<{ Params: { name: string }; Body: InsertBody }>,
      reply: FastifyReply
    ) => {
      const name = req.params.name;
      validateTable(db, name);
      const schema = getSchema(db, name);
      const cols = new Set(schema.columns.map((c) => c.name));
      const entries = Object.entries(req.body.values).filter(([k]) => cols.has(k));
      if (entries.length === 0) {
        return reply.status(400).send({ error: "No valid values" });
      }
      const columns = entries.map(([k]) => escapeIdent(k)).join(", ");
      const placeholders = entries.map(([k]) => `@v_${k}`).join(", ");
      const sql = `INSERT INTO ${escapeIdent(name)} (${columns}) VALUES (${placeholders})`;
      const params: Record<string, unknown> = {};
      for (const [k, v] of entries) params[`v_${k}`] = v;
      const info = db.prepare(sql).run(params);
      reply.send({ ok: true, lastInsertRowid: info.lastInsertRowid });
    }
  );

  fastify.delete(
    "/db/table/:name/row",
    async (
      req: FastifyRequest<{ Params: { name: string }; Body: DeleteBody }>,
      reply: FastifyReply
    ) => {
      const name = req.params.name;
      validateTable(db, name);
      const schema = getSchema(db, name);
      const keyCols =
        schema.primaryKey.length > 0 ? schema.primaryKey : ["__rowid__"];
      for (const k of keyCols) {
        if (!(k in req.body.key)) {
          return reply.status(400).send({ error: "Missing key" });
        }
      }
      const whereClause = keyCols
        .map((c) => `${c === "__rowid__" ? "rowid" : escapeIdent(c)} = @k_${c}`)
        .join(" AND ");
      const sql = `DELETE FROM ${escapeIdent(name)} WHERE ${whereClause}`;
      const params: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(req.body.key)) params[`k_${k}`] = v;
      const info = db.prepare(sql).run(params);
      reply.send({ ok: true, changes: info.changes });
    }
  );
}

