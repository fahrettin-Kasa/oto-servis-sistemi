import connectDB from "@/utils/db";
import Firm from "@/models/Firm";

// GET endpoint: Firmaları getirir
export async function GET(request) {
  await connectDB();
  try {
    const firms = await Firm.find().sort({ name: 1 });
    return new Response(
      JSON.stringify({
        success: true,
        firms: firms,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Firmalar alınırken bir hata oluştu",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}

// POST endpoint: Yeni firma ekler
export async function POST(request) {
  await connectDB();
  try {
    const data = await request.json();
    const firm = new Firm(data);
    await firm.save();

    return new Response(
      JSON.stringify({
        success: true,
        firm: firm,
      }),
      { status: 201 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Firma eklenirken bir hata oluştu",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}

// PUT endpoint: Firma bakiyesini günceller
export async function PUT({ params, request }) {
  const { id } = params;
  const data = await request.json();
  await connectDB();
  try {
    const updatedFirm = await Firm.findByIdAndUpdate(id, data, { new: true });
    if (!updatedFirm) {
      return new Response(JSON.stringify({ error: "Firma bulunamadı" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify(updatedFirm), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Firma güncellenemedi",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
