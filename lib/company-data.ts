import { prisma } from "@/lib/prisma";
import { median } from "@/lib/salary";
import type { CompanyApiResponse } from "@/types/salary";

export async function getCompanyData(slug: string): Promise<CompanyApiResponse | null> {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      salaries: {
        orderBy: { total_compensation: "desc" },
        include: { company: true }
      }
    }
  });

  if (!company) return null;

  const level_distribution = company.salaries.reduce<Record<string, number>>((acc, salary) => {
    acc[salary.level] = (acc[salary.level] ?? 0) + 1;
    return acc;
  }, {});

  const { salaries, ...companyDetails } = company;

  return {
    company: companyDetails,
    salaries,
    median_total_compensation: median(company.salaries.map((salary) => salary.total_compensation)),
    level_distribution
  };
}
