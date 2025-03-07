import connectDB from "@/utils/db";
import Firm from "@/models/Firm";
import { NextResponse } from "next/server";
import Job from "@/models/Job";

export async function POST(request, { params }) {
  try {
    console.log("=== Ödeme API'si başlatıldı ===");
    const { id } = params;
    console.log("Firma ID:", id);

    const body = await request.json();
    console.log("Gelen veri:", body);

    const { amount, description } = body;

    // Tutar kontrolü
    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      console.log("Geçersiz tutar:", amount);
      return NextResponse.json(
        { error: "Geçerli bir ödeme tutarı giriniz" },
        { status: 400 }
      );
    }

    console.log("Veritabanına bağlanılıyor...");
    await connectDB();
    console.log("Veritabanı bağlantısı başarılı");

    // Firmayı bul
    console.log("Firma aranıyor:", id);
    const firm = await Firm.findById(id);
    if (!firm) {
      console.log("Firma bulunamadı:", id);
      return NextResponse.json({ error: "Firma bulunamadı" }, { status: 404 });
    }
    console.log("Firma bulundu:", firm.name);

    // Firmaya ait işleri getir
    const jobs = await Job.find({ firm: id });
    console.log("İş sayısı:", jobs.length);

    // Toplam bakiye hesaplama (tüm işlerin toplamı)
    const totalBalance = jobs.reduce((total, job) => {
      return total + (Number(job.price) || 0);
    }, 0);
    console.log("Toplam bakiye:", totalBalance);

    // Ödenen toplam miktar
    const totalPaidAmount =
      firm.payments?.reduce((total, payment) => {
        return total + (Number(payment.amount) || 0);
      }, 0) || 0;
    console.log("Ödenen toplam:", totalPaidAmount);

    // Güncel bakiye (toplam - ödenen)
    const currentBalance = totalBalance - totalPaidAmount;
    console.log("Güncel bakiye:", currentBalance);

    // Bakiye kontrolü
    if (currentBalance < paymentAmount) {
      console.log("Bakiye yetersiz!");
      return NextResponse.json(
        { error: "Firma bakiyesi yetersiz" },
        { status: 400 }
      );
    }

    // Ödeme kaydını ekle
    const payment = {
      amount: paymentAmount,
      description: description || "Ödeme",
      date: new Date(),
    };
    console.log("Eklenecek ödeme:", payment);

    // Ödemeleri kontrol et
    if (!Array.isArray(firm.payments)) {
      console.log("Payments array'i yok, oluşturuluyor");
      firm.payments = [];
    }

    // Ödemeyi ekle
    firm.payments.push(payment);

    console.log("Firma güncelleniyor...");
    // Firmayı kaydet
    const updatedFirm = await firm.save();
    console.log("Firma güncellendi:", updatedFirm);

    return NextResponse.json({
      success: true,
      message: "Ödeme başarıyla kaydedildi",
      firm: updatedFirm,
    });
  } catch (error) {
    console.error("=== Ödeme kaydetme hatası ===");
    console.error("Hata detayları:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      errors: error.errors,
    });

    // MongoDB validation error
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        {
          error: "Validasyon hatası",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // MongoDB cast error (invalid ID)
    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Geçersiz ID formatı" },
        { status: 400 }
      );
    }

    // MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Bu kayıt zaten mevcut" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Ödeme kaydedilirken bir hata oluştu",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
