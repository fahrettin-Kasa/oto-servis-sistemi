import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Stock from "@/models/Stock";

export async function GET() {
  try {
    await connectDB();
    const stocks = await Stock.find().sort({ name: 1 });
    return NextResponse.json({ success: true, stocks });
  } catch (error) {
    return NextResponse.json(
      { error: "Stok listesi alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const stock = await Stock.create(data);
    return NextResponse.json(stock, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Stok eklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
