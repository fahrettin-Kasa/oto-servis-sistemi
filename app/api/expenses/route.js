import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import Expense from "@/models/Expense";

export async function GET(request) {
  try {
    await dbConnect();
    const expenses = await Expense.find().sort({ date: -1 });
    return NextResponse.json({ expenses });
  } catch (error) {
    return NextResponse.json(
      { error: "Giderler alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const expense = new Expense(data);
    await expense.save();

    return NextResponse.json({
      success: true,
      message: "Gider başarıyla eklendi",
      expense,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gider eklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
