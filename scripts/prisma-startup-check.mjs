import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const requiredTables = ["Company", "Salary"];
const requiredEnums = ["Level", "Currency", "Source"];

function logMigrationHelp() {
  console.error("[prisma] Database schema is not ready.");
  console.error("[prisma] Development: run `pnpm prisma:migrate` or restart with `pnpm dev`.");
  console.error("[prisma] Production/CI: run `pnpm prisma:deploy` before serving traffic.");
}

async function main() {
  console.log("[prisma] Verifying database schema...");

  const tables = await prisma.$queryRaw`
    SELECT tablename AS name
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('Company', 'Salary')
  `;

  const enums = await prisma.$queryRaw`
    SELECT typname AS name
    FROM pg_catalog.pg_type
    WHERE typname IN ('Level', 'Currency', 'Source')
  `;

  const tableNames = new Set(tables.map((table) => table.name));
  const enumNames = new Set(enums.map((enumType) => enumType.name));
  const missingTables = requiredTables.filter((table) => !tableNames.has(table));
  const missingEnums = requiredEnums.filter((enumType) => !enumNames.has(enumType));

  if (missingTables.length > 0 || missingEnums.length > 0) {
    logMigrationHelp();
    console.error(`[prisma] Missing tables: ${missingTables.join(", ") || "none"}`);
    console.error(`[prisma] Missing enums: ${missingEnums.join(", ") || "none"}`);
    process.exitCode = 1;
    return;
  }

  await prisma.company.findFirst({ select: { id: true } });
  await prisma.salary.findFirst({ select: { id: true } });

  console.log("[prisma] Schema check passed: Company, Salary, Level, Currency, and Source exist.");
}

main()
  .catch((error) => {
    logMigrationHelp();
    console.error("[prisma] Startup check failed before the app was started.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
