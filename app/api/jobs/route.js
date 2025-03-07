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

    // Parçaları kontrol et ve stok miktarlarını güncelle
    if (data.parts && data.parts.length > 0) {
      for (const partData of data.parts) {
        const stock = await Stock.findById(partData.part);
        if (!stock) {
          return NextResponse.json(
            { error: "Parça bulunamadı" },
            { status: 404 }
          );
        }

        // Stok miktarını kontrol et
        if (stock.quantity < partData.quantity) {
          return NextResponse.json(
            { error: `${stock.name} için yeterli stok yok` },
            { status: 400 }
          );
        }

        // Stok miktarını güncelle
        stock.quantity -= partData.quantity;
        await stock.save();
      }
    }

    // İşi oluştur
    const job = await Job.create(data);

    // Eğer iş bir firmaya aitse, firmanın bakiyesini güncelle
    if (data.firm) {
      const firm = await Firm.findById(data.firm);
      if (firm) {
        const jobPrice = Number(data.price) || 0;
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

// PUT endpoint: İş günceller
export async function PUT(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { id } = data;

    // Mevcut işi bul
    const existingJob = await Job.findById(id);
    if (!existingJob) {
      return NextResponse.json({ error: "İş bulunamadı" }, { status: 404 });
    }

    // Parçaları kontrol et ve stok miktarlarını güncelle
    if (data.parts && data.parts.length > 0) {
      // Önce eski parçaları stoka geri ekle
      for (const oldPart of existingJob.parts) {
        const stock = await Stock.findById(oldPart.part);
        if (stock) {
          stock.quantity += oldPart.quantity;
          await stock.save();
        }
      }

      // Yeni parçaları stoktan düş
      for (const partData of data.parts) {
        const stock = await Stock.findById(partData.part);
        if (!stock) {
          return NextResponse.json(
            { error: "Parça bulunamadı" },
            { status: 404 }
          );
        }

        // Stok miktarını kontrol et
        if (stock.quantity < partData.quantity) {
          return NextResponse.json(
            { error: `${stock.name} için yeterli stok yok` },
            { status: 400 }
          );
        }

        // Stok miktarını güncelle
        stock.quantity -= partData.quantity;
        await stock.save();
      }
    }

    // İşi güncelle
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    console.log("İş başarıyla güncellendi:", updatedJob);
    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("İş güncelleme hatası:", error);
    return NextResponse.json(
      { error: "İş güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
