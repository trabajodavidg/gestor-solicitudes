import Loki from "lokijs";
import path from "path";
import fs from "fs";
import type { Solicitud } from "@/models/Solicitud";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "database.db");

declare global {
  var __lokiDb: Loki | undefined;
  var __solicitudesInit: Promise<Collection<Solicitud>> | undefined;
}

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadDb(db: Loki) {
  return new Promise<void>((resolve, reject) => {
    db.loadDatabase({}, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export async function getSolicitudesCollection(): Promise<
  Collection<Solicitud>
> {
  ensureDataDir();

  if (!globalThis.__lokiDb) {
    globalThis.__lokiDb = new Loki(dbPath, {
      autosave: true,
      autosaveInterval: 4000,
    });
  }

  const db = globalThis.__lokiDb;

  if (!globalThis.__solicitudesInit) {
    globalThis.__solicitudesInit = (async () => {
      await loadDb(db);

      const collection =
        db.getCollection<Solicitud>("solicitudes") ||
        db.addCollection<Solicitud>("solicitudes", {
          indices: ["id", "userId"],
        });

      return collection;
    })();
  }

  return globalThis.__solicitudesInit;
}