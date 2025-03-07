import connectDB from "@/utils/db";
import Job from "@/models/Job";
import Firm from "@/models/Firm";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { id } = params;
  console.log("=== İş iptal işlemi başlatıldı ===");
  console.log("İş ID:", id);

  try {
    await connectDB();
    console.log("Veritabanı bağlantısı başarılı");

    // İş kaydını bul
    const job = await Job.findById(id);
    console.log("İş arama sonucu:", job ? "Bulundu" : "Bulunamadı");

    if (!job) {
      console.log("İş bulunamadı:", id);
      return NextResponse.json({ error: "İş bulunamadı" }, { status: 404 });
    }

    // İşin zaten iptal edilmiş olup olmadığını kontrol et
    if (job.status === "İptal") {
      console.log("İş zaten iptal edilmiş:", id);
      return NextResponse.json(
        { error: "Bu iş zaten iptal edilmiş" },
        { status: 400 }
      );
    }

    // Firma bakiyesini güncelle
    console.log("Firma aranıyor:", job.firm);
    const firm = await Firm.findById(job.firm);

    if (!firm) {
      console.log("Firma bulunamadı:", job.firm);
      return NextResponse.json({ error: "Firma bulunamadı" }, { status: 404 });
    }

    console.log("Firma bilgileri:", {
      firmaId: firm._id,
      mevcutLimit: firm.limit,
      iadeTutarı: job.price,
    });

    // Bakiyeyi iade et
    firm.limit += job.price;
    await firm.save();
    console.log("Firma bakiyesi güncellendi:", {
      firmaId: firm._id,
      eskiBakiye: firm.limit - job.price,
      iadeTutarı: job.price,
      yeniBakiye: firm.limit,
    });

    // İşin durumunu güncelle - validateBeforeSave: false ile
    await Job.findByIdAndUpdate(
      job._id,
      { status: "İptal" },
      {
        new: true,
        runValidators: false,
      }
    );

    console.log("İş durumu güncellendi:", {
      isId: job._id,
      yeniDurum: "İptal",
    });

    return NextResponse.json({
      success: true,
      message: "İş başarıyla iptal edildi",
      job: job,
    });
  } catch (error) {
    console.error("İptal işlemi hatası:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });

    return NextResponse.json(
      { error: `İş iptal edilirken bir hata oluştu: ${error.message}` },
      { status: 500 }
    );
  }
}
