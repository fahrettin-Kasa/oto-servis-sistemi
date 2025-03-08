import connectDB from "@/utils/db";
import Job from "@/models/Job";
import { NextResponse } from "next/server";
import Firm from "@/models/Firm";

// GET: Belirli bir işin detaylarını getirir
export async function GET(request, { params }) {
  const { id } = await params;
  console.log("=== GET request started for job ID:", id);

  await connectDB();
  try {
    let job = await Job.findById(id)
      .populate("firm", "name")
      .populate("customer", "name")
      .populate({
        path: "parts.part",
        model: "Stock",
        select: "name code category salePrice purchasePrice unit",
      });

    if (!job) {
      console.log("Job not found:", id);
      return new Response(JSON.stringify({ error: "İş bulunamadı" }), {
        status: 404,
      });
    }

    // Verileri object formatına çevir
    const jobData = job.toObject();
    console.log("Original job data:", jobData);

    // Eksik alanları varsayılan değerlerle doldur ve veritabanını güncelle
    const updateFields = {
      name: jobData.name || "",
      phone: jobData.phone || "",
      brand: jobData.brand || "",
      model: jobData.model || "",
      plate: jobData.plate || "",
      job: jobData.job || "",
      vehicle:
        jobData.vehicle === "swdan" ? "sedan" : jobData.vehicle || "sedan",
      status: jobData.status || "Beklemede",
      parts: jobData.parts || [],
      partsTotal:
        jobData.parts?.reduce(
          (total, part) =>
            total + (part.part?.salePrice || part.price) * part.quantity,
          0
        ) || 0,
      price: jobData.price || 0,
    };

    // Veritabanını güncelle
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    )
      .populate("firm", "name")
      .populate("customer", "name")
      .populate({
        path: "parts.part",
        model: "Stock",
        select: "name code category salePrice purchasePrice unit",
      });

    console.log("Database updated with fields:", updateFields);
    console.log("Updated job data:", updatedJob);

    return new Response(JSON.stringify({ success: true, job: updatedJob }), {
      status: 200,
    });
  } catch (error) {
    console.error("GET error:", error);
    return new Response(
      JSON.stringify({ error: "İş detayları alınırken bir hata oluştu" }),
      { status: 500 }
    );
  }
}

// PUT: Belirli bir işi günceller
export async function PUT(req, { params }) {
  console.log("=== PUT request started ===");
  const { id } = await params;
  console.log("Job ID:", id);

  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connection successful");

    console.log("Parsing request body...");
    const updateData = await req.json();
    console.log("Request data:", updateData);

    // Müşteri verisini düzelt
    if (updateData.customer && updateData.customer._id) {
      updateData.customer = updateData.customer._id;
    }

    // Mevcut işi bul
    const currentJob = await Job.findById(id);
    if (!currentJob) {
      return NextResponse.json({ error: "İş bulunamadı" }, { status: 404 });
    }

    // İş durumu değişiyorsa ve firma varsa
    if (updateData.status && currentJob.firm) {
      const firm = await Firm.findById(currentJob.firm);
      if (firm) {
        // Eğer iş tamamlandıysa ve önceki durum tamamlandı değilse
        if (
          updateData.status === "Tamamlandı" &&
          currentJob.status !== "Tamamlandı"
        ) {
          firm.balance += currentJob.price || 0;
        }
        // Eğer iş tamamlandı değilse ve önceki durum tamamlandıysa
        else if (
          updateData.status !== "Tamamlandı" &&
          currentJob.status === "Tamamlandı"
        ) {
          firm.balance -= currentJob.price || 0;
        }
        await firm.save();
      }
    }

    // İşi güncelle
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateData,
          status: updateData.status || currentJob.status,
          partsTotal:
            updateData.parts?.reduce(
              (total, part) => total + part.price * part.quantity,
              0
            ) || 0,
          price: updateData.price || currentJob.price || 0,
        },
      },
      { new: true, runValidators: true }
    )
      .populate("firm", "name")
      .populate("customer", "name")
      .populate({
        path: "parts.part",
        model: "Stock",
        select: "name code category salePrice purchasePrice unit",
      });

    console.log("Database update result:", updatedJob);

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error("=== Update error ===");
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json(
      { error: "İş güncellenirken bir hata oluştu", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Belirli bir işi siler
export async function DELETE(request, { params }) {
  await connectDB();
  try {
    const job = await Job.findById(params.id);

    if (!job) {
      return new Response(JSON.stringify({ error: "İş bulunamadı" }), {
        status: 404,
      });
    }

    // Eğer iş tamamlandıysa ve firma varsa, bakiyeyi düş
    if (job.status === "Tamamlandı" && job.firm) {
      const firm = await Firm.findById(job.firm);
      if (firm) {
        firm.balance -= job.price || 0;
        await firm.save();
      }
    }

    await Job.findByIdAndDelete(params.id);
    return new Response(
      JSON.stringify({ success: true, message: "İş başarıyla silindi" }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "İş silinirken bir hata oluştu" }),
      { status: 500 }
    );
  }
}
