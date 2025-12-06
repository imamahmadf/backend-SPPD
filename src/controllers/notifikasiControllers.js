const { personil } = require("../models");

// Helper function untuk emit notifikasi
// Bisa dipanggil dari controller manapun yang memiliki akses ke io
const emitNotifikasiPersonil = async (io) => {
  try {
    const count = await personil.count({
      where: { statusId: 2 },
    });

    console.log("🚀 Emit notifikasi:terbaru dengan count =", count);

    io.emit("notifikasi:terbaru", {
      message: "Jumlah personil statusId=2 berubah",
      count,
      timestamp: new Date().toISOString(),
    });

    return count;
  } catch (err) {
    console.error("❌ Error emit notifikasi:", err);
    throw err;
  }
};

module.exports = {
  getNotifikasi: async (req, res) => {
    try {
      const io = req.app.get("socketio");
      const count = await emitNotifikasiPersonil(io);

      res.status(200).json({
        count,
        message: "Notifikasi berhasil dikirim",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  // Export helper function agar bisa digunakan di controller lain
  emitNotifikasiPersonil,
};
