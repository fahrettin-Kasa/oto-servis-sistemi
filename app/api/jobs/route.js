import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import Job from "@/models/Job";
import Stock from "@/models/Stock";
import Customer from "@/models/Customer";
import Firm from "@/models/Firm";

// GET endpoint: Firmalarla ilişkili işleri getirir
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customer = searchParams.get("customer");
    const firm = searchParams.get("firm");

    await dbConnect();

    let query = {};
    if (customer) {
      query.customer = customer;
    }
    if (firm) {
      query.firm = firm;
    }

    const jobs = await Job.find(query)
      .populate("customer", "name")
      .populate("firm", "name")
      .sort({ date: -1 });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("İşler getirme hatası:", error);
    return NextResponse.json(
      { error: "İşler alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST endpoint: Yeni iş ekler
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    // İşi oluştur
    const job = await Job.create(data);

    // Eğer iş bir firmaya aitse, firmanın bakiyesini güncelle
    if (data.firm) {
      const firm = await Firm.findById(data.firm);
      if (firm) {
        const jobPrice = Number(data.price) || 0;

        // Hem toplam bakiyeye hem de güncel bakiyeye ekle
        firm.totalBalance = (firm.totalBalance || 0) + jobPrice;
        firm.currentBalance = (firm.currentBalance || 0) + jobPrice;

        await firm.save();
      }
    }

    // Eğer iş bir müşteriye aitse, müşterinin bakiyesini güncelle
    if (data.customer) {
      const customer = await Customer.findById(data.customer);
      if (customer) {
        const jobPrice = Number(data.price) || 0;

        // Hem toplam bakiyeye hem de güncel bakiyeye ekle
        customer.totalBalance = (customer.totalBalance || 0) + jobPrice;
        customer.currentBalance = (customer.currentBalance || 0) + jobPrice;

        await customer.save();
      }
    }

    console.log("İş başarıyla oluşturuldu:", job);
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("İş ekleme hatası:", error);
    console.error("Hata detayları:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { error: "İş eklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
