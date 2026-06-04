import { NextResponse } from "next/server";
import { getCompanyData } from "@/lib/company-data";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const data = await getCompanyData(slug);

    if (!data) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    return NextResponse.json(
      data,
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
