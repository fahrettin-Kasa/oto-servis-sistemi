import { NextResponse } from "next/server";
import Job from "@/models/Job";
import Expense from "@/models/Expense";
import dbConnect from "@/utils/db";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reportType = searchParams.get("reportType") || "daily";

    // Tarih aralığını ayarla
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // İşleri getir
    const jobs = await Job.find({
      date: { $gte: start, $lte: end },
      status: "Tamamlandı",
    })
      .populate("firm")
      .populate("customer");

    console.log("Bulunan tamamlanmış işler:", jobs.length);
    console.log(
      "İş detayları:",
      jobs.map((job) => ({
        id: job._id,
        amount: job.amount,
        price: job.price,
        partsTotal: job.partsTotal,
        status: job.status,
        firm: job.firm?.name,
        customer: job.customer?.name || job.name,
        type: job.type,
      }))
    );

    // Gelir detaylarını hesapla
    const incomeByType = jobs.reduce((acc, job) => {
      const jobAmount = job.amount || job.price || 0;
      const type = job.firm ? "Firma" : "Müşteri";
      const source = job.firm ? job.firm?.name : job.customer?.name || job.name;

      if (!acc[type]) {
        acc[type] = {
          total: 0,
          sources: {},
        };
      }

      acc[type].total += jobAmount;
      acc[type].sources[source] = (acc[type].sources[source] || 0) + jobAmount;

      return acc;
    }, {});

    // Giderleri getir
    const expenses = await Expense.find({
      date: { $gte: start, $lte: end },
    });
    console.log("Bulunan giderler:", expenses.length);

    // Toplam gelir ve giderleri hesapla
    const totalIncome = jobs.reduce((sum, job) => {
      const jobAmount = job.amount || job.price || 0;
      console.log(`İş ${job._id} için gelir:`, jobAmount);
      return sum + jobAmount;
    }, 0);
    console.log("Toplam gelir:", totalIncome);

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );
    console.log("Toplam gider:", totalExpenses);

    const netProfit = totalIncome - totalExpenses;
    console.log("Net kar:", netProfit);

    // Kategori bazlı giderleri hesapla
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] =
        (acc[expense.category] || 0) + (expense.amount || 0);
      return acc;
    }, {});

    // Trend verisi oluştur
    let trendData = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayJobs = jobs.filter(
        (job) => job.date >= dayStart && job.date <= dayEnd
      );
      const dayExpenses = expenses.filter(
        (expense) => expense.date >= dayStart && expense.date <= dayEnd
      );

      const dayIncome = dayJobs.reduce((sum, job) => {
        const jobAmount = job.amount || job.price || 0;
        return sum + jobAmount;
      }, 0);
      const dayExpense = dayExpenses.reduce(
        (sum, expense) => sum + (expense.amount || 0),
        0
      );

      trendData.push({
        date: dateStr,
        income: dayIncome,
        expenses: dayExpense,
      });

      // Tarihi bir sonraki güne/haftaya/aya taşı
      switch (reportType) {
        case "daily":
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case "weekly":
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case "monthly":
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netProfit,
      expensesByCategory,
      incomeByType,
      expenses,
      trendData,
    });
  } catch (error) {
    console.error("Rapor oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Rapor oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
