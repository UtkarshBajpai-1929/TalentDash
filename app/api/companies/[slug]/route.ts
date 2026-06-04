import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { median } from "@/lib/salary";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        salaries: {
          orderBy: { total_compensation: "desc" },
          include: { company: true }
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    const level_distribution = company.salaries.reduce<Record<string, number>>((acc, salary) => {
      acc[salary.level] = (acc[salary.level] ?? 0) + 1;
      return acc;
    }, {});

    const { salaries, ...companyDetails } = company;

    return NextResponse.json(
      {
        company: companyDetails,
        salaries,
        median_total_compensation: median(company.salaries.map((salary) => salary.total_compensation)),
        level_distribution
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
        }
      }
    );
  } catch (error) {
    console.error("GET /api/companies/[slug] failed", error);
    return NextResponse.json({ error: "Unable to load company." }, { status: 500 });
  }
}
