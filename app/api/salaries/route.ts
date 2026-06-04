import { NextResponse } from "next/server";
import { parseSalaryFilters } from "@/lib/api";
import { getSalariesData } from "@/lib/salaries-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = parseSalaryFilters(searchParams);
    const data = await getSalariesData(filters);

    return NextResponse.json(
      data,
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
