import { Currency, Level, PrismaClient, Source } from "@prisma/client";
import { displayCompanyName, normalizeCompanyName, slugFromCompanyName } from "../lib/company";
import { computeTotalCompensation } from "../lib/salary";

const prisma = new PrismaClient();

type CompanySeed = {
  name: string;
  industry: string;
  headquarters: string;
  founded_year: number;
  headcount_range: string;
};

type SalarySeed = {
  company: string;
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experience_years: number;
  base_salary: number;
  bonus?: number;
  stock?: number;
  source: Source;
  confidence_score: number;
  is_verified: boolean;
};

const companies: CompanySeed[] = [
  { name: "Google India", industry: "Internet", headquarters: "Bengaluru, India", founded_year: 1998, headcount_range: "10000+" },
  { name: "Amazon", industry: "E-commerce and Cloud", headquarters: "Hyderabad, India", founded_year: 1994, headcount_range: "10000+" },
  { name: "Meta", industry: "Social Technology", headquarters: "Gurugram, India", founded_year: 2004, headcount_range: "10000+" },
  { name: "Microsoft", industry: "Software and Cloud", headquarters: "Hyderabad, India", founded_year: 1975, headcount_range: "10000+" },
  { name: "Flipkart", industry: "E-commerce", headquarters: "Bengaluru, India", founded_year: 2007, headcount_range: "5000-10000" },
  { name: "Meesho", industry: "E-commerce", headquarters: "Bengaluru, India", founded_year: 2015, headcount_range: "1000-5000" },
  { name: "NVIDIA", industry: "Semiconductors", headquarters: "Bengaluru, India", founded_year: 1993, headcount_range: "10000+" },
  { name: "TCS", industry: "IT Services", headquarters: "Mumbai, India", founded_year: 1968, headcount_range: "10000+" },
  { name: "Infosys", industry: "IT Services", headquarters: "Bengaluru, India", founded_year: 1981, headcount_range: "10000+" },
  { name: "Wipro", industry: "IT Services", headquarters: "Bengaluru, India", founded_year: 1945, headcount_range: "10000+" },
  { name: "Razorpay", industry: "Fintech", headquarters: "Bengaluru, India", founded_year: 2014, headcount_range: "1000-5000" },
  { name: "Zepto", industry: "Quick Commerce", headquarters: "Mumbai, India", founded_year: 2021, headcount_range: "1000-5000" }
];

const salaries: SalarySeed[] = [
  ["GOOGLE", "Software Engineer", Level.L3, "Bengaluru", Currency.INR, 2, 3600000, 500000, 1200000, Source.CONTRIBUTOR, 0.91, true],
  ["Google India", "Software Engineer", Level.L4, "Hyderabad", Currency.INR, 4, 5200000, 800000, 2400000, Source.CONTRIBUTOR, 0.94, true],
  ["google", "Senior Software Engineer", Level.L5, "Bengaluru", Currency.INR, 7, 7600000, 1200000, 4200000, Source.SCRAPED, 0.87, false],
  ["Google India", "Staff Software Engineer", Level.STAFF, "Bengaluru", Currency.USD, 11, 145000, 25000, 90000, Source.CONTRIBUTOR, 0.88, true],
  ["Google India", "Principal Engineer", Level.PRINCIPAL, "Bengaluru", Currency.INR, 15, 10500000, 1800000, 9800000, Source.AI_INFERRED, 0.76, false],
  ["Amazon", "Software Development Engineer", Level.SDE_I, "Hyderabad", Currency.INR, 1, 2400000, 300000, 450000, Source.CONTRIBUTOR, 0.89, true],
  ["Amazon", "Software Development Engineer", Level.SDE_II, "Bengaluru", Currency.INR, 4, 4200000, 650000, 1200000, Source.CONTRIBUTOR, 0.92, true],
  ["Amazon", "Senior SDE", Level.SDE_III, "Chennai", Currency.INR, 8, 6500000, 900000, 2200000, Source.SCRAPED, 0.84, false],
  ["Amazon", "Engineering Manager", Level.L6, "Hyderabad", Currency.INR, 12, 8800000, 1500000, 4200000, Source.CONTRIBUTOR, 0.86, true],
  ["Amazon", "Applied Scientist", Level.IC5, "Bengaluru", Currency.USD, 9, 120000, 18000, 55000, Source.AI_INFERRED, 0.73, false],
  ["Meta", "Software Engineer", Level.IC4, "Gurugram", Currency.INR, 4, 5600000, 700000, 3600000, Source.CONTRIBUTOR, 0.90, true],
  ["Meta", "Software Engineer", Level.IC5, "Bengaluru", Currency.INR, 7, 8200000, 1300000, 6200000, Source.CONTRIBUTOR, 0.91, true],
  ["Meta", "Production Engineer", Level.L4, "Hyderabad", Currency.INR, 5, 5000000, 0, 2800000, Source.SCRAPED, 0.82, false],
  ["Meta", "Staff Engineer", Level.STAFF, "Bengaluru", Currency.USD, 12, 155000, 30000, 110000, Source.CONTRIBUTOR, 0.87, true],
  ["Meta", "Machine Learning Engineer", Level.L5, "Gurugram", Currency.INR, 8, 7800000, 1100000, 5400000, Source.AI_INFERRED, 0.78, false],
  ["Microsoft", "Software Engineer", Level.L3, "Hyderabad", Currency.INR, 2, 2600000, 300000, 700000, Source.CONTRIBUTOR, 0.92, true],
  ["Microsoft", "Software Engineer II", Level.L4, "Bengaluru", Currency.INR, 5, 4100000, 550000, 1400000, Source.CONTRIBUTOR, 0.90, true],
  ["Microsoft", "Senior Software Engineer", Level.L5, "Noida", Currency.INR, 8, 6100000, 850000, 2600000, Source.SCRAPED, 0.85, false],
  ["Microsoft", "Principal Software Engineer", Level.PRINCIPAL, "Hyderabad", Currency.INR, 14, 9200000, 1400000, 6200000, Source.CONTRIBUTOR, 0.88, true],
  ["Microsoft", "Cloud Architect", Level.L6, "Bengaluru", Currency.USD, 11, 115000, 15000, 42000, Source.AI_INFERRED, 0.74, false],
  ["Flipkart", "Software Development Engineer", Level.SDE_I, "Bengaluru", Currency.INR, 1, 2200000, 250000, 300000, Source.CONTRIBUTOR, 0.88, true],
  ["Flipkart", "Software Development Engineer", Level.SDE_II, "Bengaluru", Currency.INR, 4, 3600000, 500000, 900000, Source.CONTRIBUTOR, 0.91, true],
  ["Flipkart", "Senior SDE", Level.SDE_III, "Bengaluru", Currency.INR, 7, 5600000, 800000, 1800000, Source.SCRAPED, 0.83, false],
  ["Flipkart", "Staff Engineer", Level.STAFF, "Bengaluru", Currency.INR, 11, 7800000, 1200000, 3600000, Source.CONTRIBUTOR, 0.86, true],
  ["Flipkart", "Data Engineer", Level.L4, "Bengaluru", Currency.INR, 5, 3300000, 0, 700000, Source.CONTRIBUTOR, 0.84, true],
  ["Meesho", "Software Development Engineer", Level.SDE_I, "Bengaluru", Currency.INR, 1, 1900000, 200000, 250000, Source.CONTRIBUTOR, 0.87, true],
  ["Meesho", "Software Development Engineer", Level.SDE_II, "Bengaluru", Currency.INR, 4, 3200000, 400000, 750000, Source.SCRAPED, 0.82, false],
  ["Meesho", "Senior Backend Engineer", Level.SDE_III, "Bengaluru", Currency.INR, 7, 4800000, 700000, 1600000, Source.CONTRIBUTOR, 0.89, true],
  ["Meesho", "Staff Backend Engineer", Level.STAFF, "Bengaluru", Currency.INR, 10, 6900000, 1000000, 3000000, Source.AI_INFERRED, 0.75, false],
  ["Meesho", "Product Engineer", Level.L5, "Remote India", Currency.INR, 6, 4300000, 350000, 1300000, Source.CONTRIBUTOR, 0.84, true],
  ["NVIDIA", "GPU Systems Engineer", Level.IC4, "Pune", Currency.INR, 4, 4200000, 500000, 1900000, Source.CONTRIBUTOR, 0.90, true],
  ["NVIDIA", "Senior Software Engineer", Level.IC5, "Bengaluru", Currency.INR, 8, 7000000, 900000, 4200000, Source.CONTRIBUTOR, 0.92, true],
  ["NVIDIA", "Principal Engineer", Level.PRINCIPAL, "Bengaluru", Currency.USD, 15, 135000, 22000, 85000, Source.SCRAPED, 0.83, false],
  ["NVIDIA", "Compiler Engineer", Level.L5, "Hyderabad", Currency.INR, 7, 6200000, 700000, 3000000, Source.CONTRIBUTOR, 0.86, true],
  ["NVIDIA", "Research Engineer", Level.L6, "Bengaluru", Currency.INR, 11, 8600000, 1100000, 5200000, Source.AI_INFERRED, 0.77, false],
  ["TCS", "Systems Engineer", Level.L3, "Pune", Currency.INR, 2, 850000, 60000, 0, Source.CONTRIBUTOR, 0.88, true],
  ["TCS", "IT Analyst", Level.L4, "Chennai", Currency.INR, 5, 1450000, 120000, 0, Source.CONTRIBUTOR, 0.90, true],
  ["TCS", "Assistant Consultant", Level.L5, "Mumbai", Currency.INR, 8, 2300000, 180000, 0, Source.SCRAPED, 0.82, false],
  ["TCS", "Technical Architect", Level.L6, "Bengaluru", Currency.INR, 12, 3600000, 300000, 0, Source.CONTRIBUTOR, 0.84, true],
  ["TCS", "Principal Consultant", Level.PRINCIPAL, "Hyderabad", Currency.INR, 16, 5200000, 450000, 0, Source.AI_INFERRED, 0.74, false],
  ["Infosys", "Specialist Programmer", Level.L3, "Bengaluru", Currency.INR, 2, 1100000, 80000, 0, Source.CONTRIBUTOR, 0.89, true],
  ["Infosys", "Technology Analyst", Level.L4, "Pune", Currency.INR, 5, 1550000, 120000, 0, Source.CONTRIBUTOR, 0.88, true],
  ["Infosys", "Technology Lead", Level.L5, "Mysuru", Currency.INR, 8, 2400000, 180000, 0, Source.SCRAPED, 0.80, false],
  ["Infosys", "Engineering Manager", Level.L6, "Bengaluru", Currency.INR, 12, 3900000, 280000, 0, Source.CONTRIBUTOR, 0.83, true],
  ["Infosys", "Principal Consultant", Level.PRINCIPAL, "Hyderabad", Currency.INR, 15, 5000000, 400000, 0, Source.AI_INFERRED, 0.72, false],
  ["Wipro", "Project Engineer", Level.L3, "Bengaluru", Currency.INR, 2, 900000, 70000, 0, Source.CONTRIBUTOR, 0.87, true],
  ["Wipro", "Senior Project Engineer", Level.L4, "Hyderabad", Currency.INR, 5, 1500000, 110000, 0, Source.CONTRIBUTOR, 0.86, true],
  ["Wipro", "Technical Lead", Level.L5, "Pune", Currency.INR, 8, 2350000, 170000, 0, Source.SCRAPED, 0.79, false],
  ["Wipro", "Solution Architect", Level.L6, "Chennai", Currency.INR, 12, 3700000, 260000, 0, Source.CONTRIBUTOR, 0.82, true],
  ["Wipro", "Principal Architect", Level.PRINCIPAL, "Bengaluru", Currency.INR, 16, 4900000, 360000, 0, Source.AI_INFERRED, 0.71, false],
  ["Razorpay", "Backend Engineer", Level.L3, "Bengaluru", Currency.INR, 2, 2100000, 250000, 500000, Source.CONTRIBUTOR, 0.91, true],
  ["Razorpay", "Backend Engineer", Level.L4, "Bengaluru", Currency.INR, 5, 3600000, 500000, 1100000, Source.CONTRIBUTOR, 0.92, true],
  ["Razorpay", "Senior Platform Engineer", Level.L5, "Bengaluru", Currency.INR, 8, 5600000, 800000, 2300000, Source.SCRAPED, 0.84, false],
  ["Razorpay", "Staff Platform Engineer", Level.STAFF, "Bengaluru", Currency.INR, 11, 7600000, 1000000, 3900000, Source.CONTRIBUTOR, 0.88, true],
  ["Razorpay", "Security Engineer", Level.IC4, "Bengaluru", Currency.INR, 4, 3400000, 350000, 900000, Source.AI_INFERRED, 0.78, false],
  ["Zepto", "Software Engineer", Level.SDE_I, "Mumbai", Currency.INR, 1, 2300000, 250000, 650000, Source.CONTRIBUTOR, 0.89, true],
  ["Zepto", "Software Engineer", Level.SDE_II, "Bengaluru", Currency.INR, 4, 3900000, 450000, 1500000, Source.CONTRIBUTOR, 0.90, true],
  ["Zepto", "Senior Software Engineer", Level.SDE_III, "Mumbai", Currency.INR, 7, 6100000, 700000, 3100000, Source.SCRAPED, 0.83, false],
  ["Zepto", "Staff Engineer", Level.STAFF, "Bengaluru", Currency.INR, 10, 8400000, 1000000, 7000000, Source.CONTRIBUTOR, 0.87, true],
  ["Zepto", "Principal Engineer", Level.PRINCIPAL, "Mumbai", Currency.INR, 14, 11200000, 1600000, 12000000, Source.AI_INFERRED, 0.76, false]
].map(([company, role, level, location, currency, experience_years, base_salary, bonus, stock, source, confidence_score, is_verified]) => ({
  company,
  role,
  level,
  location,
  currency,
  experience_years,
  base_salary,
  bonus,
  stock,
  source,
  confidence_score,
  is_verified
})) as SalarySeed[];

async function main() {
  for (const company of companies) {
    const normalized_name = normalizeCompanyName(company.name);

    await prisma.company.upsert({
      where: { normalized_name },
      update: {
        name: displayCompanyName(company.name),
        industry: company.industry,
        headquarters: company.headquarters,
        founded_year: company.founded_year,
        headcount_range: company.headcount_range
      },
      create: {
        ...company,
        name: displayCompanyName(company.name),
        normalized_name,
        slug: slugFromCompanyName(company.name)
      }
    });
  }

  const allCompanies = await prisma.company.findMany();
  const companyMap = new Map(
    allCompanies.map((company) => [
      company.normalized_name,
      company.id
    ])
  );

  const salaryData = salaries.map((salary) => {
    const normalized_name = normalizeCompanyName(salary.company);
    const companyId = companyMap.get(normalized_name);
    if (!companyId) {
      throw new Error(
        `Company not found: ${salary.company}`
      );
    }

    const bonus = salary.bonus ?? 0;
    const stock = salary.stock ?? 0;

    return {
      company_id: companyId,
      role: salary.role,
      level: salary.level,
      location: salary.location,
      currency: salary.currency,
      experience_years: salary.experience_years,
      base_salary: salary.base_salary,
      bonus,
      stock,
      total_compensation: computeTotalCompensation(
        salary.base_salary,
        bonus,
        stock
      ),
      source: salary.source,
      confidence_score: salary.confidence_score,
      is_verified: salary.is_verified,
      submitted_at: new Date(
        Date.now() -
          Math.floor(Math.random() * 90) * 86400000
      )
    };
  });

  let insertedSalaryCount = 0;

  for (const salary of salaryData) {
    const existingSalary = await prisma.salary.findFirst({
      where: {
        company_id: salary.company_id,
        role: salary.role,
        level: salary.level,
        location: salary.location,
        currency: salary.currency,
        experience_years: salary.experience_years,
        base_salary: salary.base_salary,
        bonus: salary.bonus,
        stock: salary.stock,
        source: salary.source
      },
      select: { id: true }
    });

    if (existingSalary) {
      continue;
    }

    await prisma.salary.create({
      data: salary
    });
    insertedSalaryCount += 1;
  }

  return insertedSalaryCount;
}


main()
  .then(async (insertedSalaryCount) => {
    await prisma.$disconnect();
    console.log(
      `Seed complete: upserted ${companies.length} companies and inserted ${insertedSalaryCount} new salary records.`
    );
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
