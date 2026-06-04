import { buildSalaryOrder, buildSalaryWhere } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import type { SalariesApiResponse, SalaryFilters } from "@/types/salary";

export async function getSalariesData(filters: SalaryFilters): Promise<SalariesApiResponse> {
  const where = buildSalaryWhere(filters);
  const skip = (filters.page - 1) * filters.limit;

  const [total, salaries, aggregate, roleRows, locationRows] = await prisma.$transaction([
    prisma.salary.count({ where }),
    prisma.salary.findMany({
      where,
      skip,
      take: filters.limit,
      orderBy: buildSalaryOrder(filters.sort),
      include: { company: true }
    }),
    prisma.salary.aggregate({
      where,
      _avg: { total_compensation: true },
      _max: { total_compensation: true }
    }),
    prisma.salary.findMany({
      distinct: ["role"],
      orderBy: { role: "asc" },
      select: { role: true }
    }),
    prisma.salary.findMany({
      distinct: ["location"],
      orderBy: { location: "asc" },
      select: { location: true }
    })
  ]);

  return {
    salaries,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      total_pages: Math.ceil(total / filters.limit)
    },
    stats: {
      average_total_compensation: Math.round(aggregate._avg.total_compensation ?? 0),
      highest_total_compensation: aggregate._max.total_compensation ?? 0
    },
    facets: {
      roles: roleRows.map((row) => row.role),
      locations: locationRows.map((row) => row.location)
    }
  };
}
