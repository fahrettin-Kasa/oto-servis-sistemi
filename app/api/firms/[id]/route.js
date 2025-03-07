import connectDB from "@/utils/db";
import Firm from "@/models/Firm";
import { NextResponse } from "next/server";
import Job from "@/models/Job";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    // MongoDB bağlantısı
    await connectDB();

    // ID kontrolü
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Geçersiz firma ID formatı" },
        { status: 400 }
      );
    }

    // Firmayı bul
    const firm = await Firm.findById(params.id);
    if (!firm) {
      return NextResponse.json({ error: "Firma bulunamadı" }, { status: 404 });
    }

    // Firmaya ait işleri getir
    const jobs = await Job.find({ firm: params.id });

    // Toplam bakiye hesaplama (tüm işlerin toplamı)
    const totalBalance = jobs.reduce((total, job) => {
      return total + (Number(job.price) || 0);
    }, 0);

    // Ödenen toplam miktar
    const totalPaidAmount =
      firm.payments?.reduce((total, payment) => {
        return total + (Number(payment.amount) || 0);
      }, 0) || 0;

    // Güncel bakiye (toplam - ödenen)
    const currentBalance = totalBalance - totalPaidAmount;

    // Yanıt hazırla
    const response = {
      firm: {
        ...firm.toObject(),
        totalBalance,
        currentBalance,
      },
      jobs,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Firma detay hatası:", error);

    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Geçersiz ID formatı" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Firma bilgileri alınamadı", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const data = await request.json();

    const firm = await Firm.findByIdAndUpdate(
      id,
      {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        taxNumber: data.taxNumber,
      },
      { new: true }
    );

    if (!firm) {
      return NextResponse.json({ error: "Firma bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Firma başarıyla güncellendi",
      firm,
    });
  } catch (error) {
    console.error("Firma güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Firma güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const firm = await Firm.findById(id);
    if (!firm) {
      return NextResponse.json({ error: "Firma bulunamadı" }, { status: 404 });
    }

    // Firmanın aktif işlerini kontrol et
    const activeJobs = await Job.find({
      firm: id,
      status: { $ne: "Tamamlandı" },
    });

    if (activeJobs.length > 0) {
      return NextResponse.json(
        { error: "Tamamlanmamış işleri olan firma silinemez" },
        { status: 400 }
      );
    }

    await Firm.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Firma başarıyla silindi",
    });
  } catch (error) {
    console.error("Firma silme hatası:", error);
    return NextResponse.json(
      { error: "Firma silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
