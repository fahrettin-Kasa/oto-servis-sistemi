import connectDB from "@/utils/db";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Job from "@/models/Job";

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    console.log("Ödeme isteği alındı:", id);

    // MongoDB ObjectId doğrulaması
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Geçersiz müşteri ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { amount, description } = body;
    const paymentAmount = Number(amount);

    console.log("Ödeme detayları:", { amount: paymentAmount, description });

    // Ödeme tutarını kontrol et
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json(
        { error: "Geçerli bir ödeme tutarı giriniz" },
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

    console.log("Müşteri bulundu:", {
      id: customer._id,
      name: customer.name,
      currentPayments: customer.payments?.length || 0,
    });

    // Müşteriye ait işleri getir
    const jobs = await Job.find({ customer: id });

    // Toplam bakiye hesaplama (tüm işlerin toplamı)
    const totalBalance = jobs.reduce((total, job) => {
      return total + (Number(job.price) || 0);
    }, 0);

    // Ödemeleri kontrol et
    const payments = Array.isArray(customer.payments) ? customer.payments : [];

    // Ödenen toplam miktar
    const totalPaidAmount = payments.reduce((total, payment) => {
      return total + (Number(payment.amount) || 0);
    }, 0);

    // Güncel bakiye (toplam - ödenen)
    const currentBalance = totalBalance - totalPaidAmount;

    console.log("Bakiye durumu:", {
      totalBalance,
      totalPaidAmount,
      currentBalance,
      requestedAmount: paymentAmount,
    });

    // Bakiye kontrolü
    if (currentBalance < paymentAmount) {
      return NextResponse.json(
        {
          error: `Yetersiz bakiye. Mevcut bakiye: ${currentBalance}₺, İstenen ödeme: ${paymentAmount}₺`,
        },
        { status: 400 }
      );
    }

    // Yeni ödemeyi ekle
    const newPayment = {
      amount: paymentAmount,
      description: description || "Ödeme",
      date: new Date(),
    };

    console.log("Eklenecek ödeme:", newPayment);

    try {
      // Ödemeleri güncelle
      const updatedCustomer = await Customer.findByIdAndUpdate(
        id,
        { $push: { payments: newPayment } },
        { new: true, runValidators: true }
      );

      if (!updatedCustomer) {
        throw new Error("Müşteri güncellenemedi");
      }

      // Güncellenmiş ödemeleri al
      const updatedPayments = Array.isArray(updatedCustomer.payments)
        ? updatedCustomer.payments
        : [];

      // Yanıtı hazırla
      const response = {
        success: true,
        message: "Ödeme başarıyla kaydedildi",
        customer: {
          ...updatedCustomer.toObject(),
          totalBalance,
          currentBalance: currentBalance - paymentAmount,
          payments: updatedPayments.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          ),
        },
        jobs,
      };

      return NextResponse.json(response);
    } catch (updateError) {
      console.error("Müşteri güncelleme hatası:", updateError);
      return NextResponse.json(
        {
          error: "Ödeme kaydedilirken bir hata oluştu",
          details: updateError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Ödeme kaydetme hatası:", error);
    return NextResponse.json(
      {
        error: "Ödeme kaydedilirken bir hata oluştu",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
