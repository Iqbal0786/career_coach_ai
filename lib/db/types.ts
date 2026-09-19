
import type { Prisma } from "@/generated/prisma/client";
import type { prisma } from "@/lib/db/prisma";

export type DbClient =
  | typeof prisma
  | Prisma.TransactionClient;