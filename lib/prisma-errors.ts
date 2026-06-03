import { Prisma } from "@prisma/client";

export function isMissingPrismaTableError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021";
}

export function logMissingPrismaTableError(route: string, error: unknown) {
  console.error(`[prisma] ${route} failed because a required database table is missing.`);
  console.error("[prisma] Run `pnpm prisma:migrate` in development or `pnpm prisma:deploy` in production.");
  console.error(error);
}
