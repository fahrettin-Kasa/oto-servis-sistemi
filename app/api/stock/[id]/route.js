import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Stock from "@/models/Stock";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const stock = await Stock.findById(params.id);
    if (!stock) {
      return NextResponse.json({ error: "Stok bulunamadı" }, { status: 404 });
    }
    return NextResponse.json(stock);
  } catch (error) {
    return NextResponse.json(
      { error: "Stok bilgisi alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const data = await request.json();
    const stock = await Stock.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!stock) {
      return NextResponse.json({ error: "Stok bulunamadı" }, { status: 404 });
    }
    return NextResponse.json(stock);
  } catch (error) {
    return NextResponse.json(
      { error: "Stok güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const stock = await Stock.findByIdAndDelete(params.id);
    if (!stock) {
      return NextResponse.json({ error: "Stok bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ message: "Stok başarıyla silindi" });
  } catch (error) {
    return NextResponse.json(
      { error: "Stok silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
