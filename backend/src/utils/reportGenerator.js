// Hanya bagian exportReport — ganti yang ini saja
exports.exportReport = async (req, res) => {
  try {
    const { type, date, month, quarter, year, format = "excel" } = req.query;

    const { whereClause, title, periodStr } = getFilter(
      type,
      date,
      month,
      quarter,
      year
    );

    const dataInsiden = await Insiden.findAll({
      where: whereClause,
      order: [["timestampDibuat", "ASC"]],
    });

    if (dataInsiden.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Tidak ada data pada periode ini" });
    }

    const safeName = periodStr.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `Laporan_${type}_${safeName}_${Date.now()}.${
      format === "pdf" ? "pdf" : "xlsx"
    }`;

    let fileUrl;
    if (format === "pdf") {
      fileUrl = await generatePDF(dataInsiden, filename, title, periodStr);
    } else {
      fileUrl = await generateExcel(dataInsiden, filename);
    }

    // Simpan ke DB
    await LaporanPeriodik.create({
      title,
      period: periodStr,
      totalIncidents: dataInsiden.length,
      averageResponseTime: "Generated",
      fileUrl,
      adminId: req.user?.id || 1,
      timestampDibuat: new Date(),
    });

    const filePath = path.join(__dirname, "../public/reports", filename);

    if (!fs.existsSync(filePath)) {
      throw new Error("File gagal disimpan");
    }

    const mimeType =
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    res.download(filePath, filename);
  } catch (error) {
    console.error("Export Error:", error.message);
    if (!res.headersSent) {
      res
        .status(400)
        .json({
          success: false,
          message: error.message || "Parameter tidak valid",
        });
    }
  }
};
