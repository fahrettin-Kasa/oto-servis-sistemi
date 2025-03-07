import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import Expense from "@/models/Expense";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const expense = await Expense.findById(params.id);

    if (!expense) {
      return NextResponse.json({ error: "Gider bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ expense });
  } catch (error) {
    return NextResponse.json(
      { error: "Gider bilgileri alınamadı" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const data = await request.json();
    const expense = await Expense.findByIdAndUpdate(params.id, data, {
      new: true,
    });

    if (!expense) {
      return NextResponse.json({ error: "Gider bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Gider başarıyla güncellendi",
      expense,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gider güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const expense = await Expense.findByIdAndDelete(params.id);

    if (!expense) {
      return NextResponse.json({ error: "Gider bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Gider başarıyla silindi",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gider silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
