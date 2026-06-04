import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const s1 = searchParams.get("s1");
    const s2 = searchParams.get("s2");

    if (!s1 || !s2) {
      return NextResponse.json({ error: "Both s1 and s2 query params are required." }, { status: 400 });
    }

    if (s1 === s2) {
      return NextResponse.json({ error: "Choose two different salary records." }, { status: 400 });
    }

    const [left, right] = await prisma.$transaction([
      prisma.salary.findUnique({ where: { id: s1 }, include: { company: true } }),
      prisma.salary.findUnique({ where: { id: s2 }, include: { company: true } })
    ]);

    if (!left || !right) {
      return NextResponse.json({ error: "One or both salary records were not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        left,
        right,
        deltas: {
          base_salary: left.base_salary - right.base_salary,
          bonus: left.bonus - right.bonus,
          stock: left.stock - right.stock,
          total_compensation: left.total_compensation - right.total_compensation,
          total_compensation_percent:
            right.total_compensation === 0 ? null : Number((((left.total_compensation - right.total_compensation) / right.total_compensation) * 100).toFixed(2))
        },
        higher_salary_id: left.total_compensation === right.total_compensation ? null : left.total_compensation > right.total_compensation ? left.id : right.id
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600"
        }
      }
    );
  } catch (error) {
    console.error("GET /api/compare failed", error);
    return NextResponse.json({ error: "Unable to compare salaries." }, { status: 500 });
  }
}
