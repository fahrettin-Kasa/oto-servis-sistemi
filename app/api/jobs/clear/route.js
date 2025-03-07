import connectDB from "@/utils/db";
import Job from "@/models/Job";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    await connectDB();
    console.log("Veritabanı bağlantısı başarılı");

    // Tüm iş kayıtlarını sil
    const result = await Job.deleteMany({});
    console.log("Silinen kayıt sayısı:", result.deletedCount);

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} adet iş kaydı silindi`,
    });
  } catch (error) {
    console.error("Toplu silme hatası:", error);
    return NextResponse.json(
      { error: "İş kayıtları silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
