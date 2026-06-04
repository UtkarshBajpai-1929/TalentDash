import { NextResponse } from "next/server";
import { buildSalaryOrder, buildSalaryWhere, parseSalaryFilters } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = parseSalaryFilters(searchParams);
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

    return NextResponse.json(
      {
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
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600"
        }
      }
    );
  } catch (error) {
    console.error("GET /api/salaries failed", error);
    return NextResponse.json({ error: "Unable to load salaries." }, { status: 500 });
  }
}
