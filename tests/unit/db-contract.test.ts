import { dbContract } from "../support/db-contract";
import { openPglite } from "@/lib/db/pglite";

dbContract("PGlite", () => openPglite());
