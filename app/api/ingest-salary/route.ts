import { NextResponse } from "next/server";
import { displayCompanyName, normalizeCompanyName, slugFromCompanyName } from "@/lib/company";
import { prisma } from "@/lib/prisma";
import { computeTotalCompensation } from "@/lib/salary";
import { validateSalaryPayload } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = validateSalaryPayload(payload);

if (!result.data) {
  return NextResponse.json(result.error, {
    status: 400
  });
}
    const input = result.data;
    const normalized_name = normalizeCompanyName(input.company_name);
    const slug = slugFromCompanyName(input.company_name);
    const bonus = input.bonus ?? 0;
    const stock = input.stock ?? 0;
    const total_compensation = computeTotalCompensation(input.base_salary, bonus, stock);

    const company = await prisma.company.upsert({
      where: { normalized_name },
      update: {
        name: displayCompanyName(input.company_name),
        industry: input.industry ?? "Technology",
        headquarters: input.headquarters ?? "India",
        founded_year: input.founded_year ?? 2000,
        headcount_range: input.headcount_range ?? "Unknown"
      },
      create: {
        name: displayCompanyName(input.company_name),
        slug,
        normalized_name,
        industry: input.industry ?? "Technology",
        headquarters: input.headquarters ?? "India",
        founded_year: input.founded_year ?? 2000,
        headcount_range: input.headcount_range ?? "Unknown"
      }
    });
const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
const salaryLowerBound = Math.floor(input.base_salary * 0.9);
const salaryUpperBound = Math.ceil(input.base_salary * 1.1);
const duplicate = await prisma.salary.findFirst({
  where: {
    company_id: company.id,
    role: input.role,
    level: input.level,
    location: input.location,
    created_at: {
      gte: fortyEightHoursAgo
    },
    base_salary: {
      gte: salaryLowerBound,
      lte: salaryUpperBound
    }
  }
});
if (duplicate) {
  return NextResponse.json(
    {
      error:
        "A similar salary record for this company, role, level, and location was submitted in the last 48 hours."
    },
    { status: 409 }
  );
}

    const salary = await prisma.salary.create({
      data: {
        company_id: company.id,
        role: input.role,
        level: input.level,
        location: input.location,
        currency: input.currency,
        experience_years: input.experience_years,
        base_salary: input.base_salary,
        bonus,
        stock,
        total_compensation,
        source: input.source,
        confidence_score: input.confidence_score ?? 80,
        is_verified: input.is_verified ?? false
      },
      include: { company: true }
    });

    return NextResponse.json({ data: salary }, { status: 201 });
  } catch (error) {
    console.error("POST /api/ingest-salary failed", error);
    return NextResponse.json({ error: "Unable to ingest salary." }, { status: 500 });
  }
}
