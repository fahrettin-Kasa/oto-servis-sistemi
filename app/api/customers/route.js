import connectDB from "@/utils/db";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";

// GET: Müşterileri listele
export async function GET() {
  try {
    await connectDB();
    console.log("Müşteri listesi getiriliyor...");

    const customers = await Customer.find().sort({ createdAt: -1 });
    console.log("Bulunan müşteri sayısı:", customers.length);

    // Her müşterinin verilerini kontrol et
    customers.forEach((customer, index) => {
      console.log(`Müşteri ${index + 1}:`, {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        vehicle: customer.vehicle,
        plate: customer.plate,
        notes: customer.notes,
      });
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Müşteri listesi hatası:", error);
    return NextResponse.json(
      { error: "Müşteriler alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST: Yeni müşteri ekle
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();

    // Boş değerleri undefined yerine boş string olarak ayarla
    const customerData = {
      name: data.name,
      phone: data.phone,
      email: data.email || "",
      vehicle: data.vehicle || "",
      plate: data.plate || "",
      notes: data.notes || "",
    };

    const customer = await Customer.create(customerData);

    return NextResponse.json({
      success: true,
      message: "Müşteri başarıyla oluşturuldu",
      customer,
    });
  } catch (error) {
    console.error("Müşteri oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Müşteri oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
