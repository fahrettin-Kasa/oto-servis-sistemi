import connectDB from "@/utils/db";
import Customer from "@/models/Customer";
import Job from "@/models/Job";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    console.log("Müşteri detayları isteniyor:", id);

    // MongoDB ObjectId doğrulaması
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Geçersiz müşteri ID" },
        { status: 400 }
      );
    }

    // Müşteriyi bul
    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json(
        { error: "Müşteri bulunamadı" },
        { status: 404 }
      );
    }

    console.log("Bulunan müşteri:", {
      id: customer._id,
      name: customer.name,
      payments: customer.payments,
    });

    // Müşterinin işlerini bul
    const jobs = await Job.find({ customer: id })
      .populate("firm", "name")
      .sort({ date: -1 })
      .lean();

    // Toplam bakiye hesaplama (tüm işlerin toplamı)
    const totalBalance = jobs.reduce((total, job) => {
      return total + (Number(job.price) || 0);
    }, 0);

    // Ödemeleri kontrol et ve toplam ödemeyi hesapla
    const payments = customer.payments || [];

    // Ödenen toplam miktar
    const totalPaidAmount = payments.reduce((total, payment) => {
      return total + (Number(payment.amount) || 0);
    }, 0);

    // Güncel bakiye (toplam - ödenen)
    const currentBalance = totalBalance - totalPaidAmount;

    // Müşteri verilerini hazırla
    const customerData = {
      ...customer.toObject(),
      totalBalance,
      currentBalance,
      payments: payments.sort((a, b) => new Date(b.date) - new Date(a.date)),
    };

    console.log("Hazırlanan müşteri verileri:", {
      totalBalance,
      currentBalance,
      paymentsCount: customerData.payments.length,
      payments: customerData.payments,
    });

    // Yanıtı hazırla
    const response = {
      customer: customerData,
      jobs,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Müşteri detay hatası:", error);
    return NextResponse.json(
      { error: "Müşteri bilgileri alınamadı: " + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const data = await request.json();

    const customer = await Customer.findByIdAndUpdate(
      id,
      {
        name: data.name,
        phone: data.phone,
        email: data.email,
        vehicle: data.vehicle,
        plate: data.plate,
        notes: data.notes,
      },
      { new: true }
    );

    if (!customer) {
      return NextResponse.json(
        { error: "Müşteri bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Müşteri başarıyla güncellendi",
      customer,
    });
  } catch (error) {
    console.error("Müşteri güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Müşteri güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return NextResponse.json(
        { error: "Müşteri bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Müşteri başarıyla silindi",
    });
  } catch (error) {
    console.error("Müşteri silme hatası:", error);
    return NextResponse.json(
      { error: "Müşteri silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
