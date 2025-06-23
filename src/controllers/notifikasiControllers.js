const { personil } = require("../models");

module.exports = {
  getNotifikasi: async (req, res) => {
    try {
      const count = await personil.count({
        where: { statusId: 2 },
      });

      const io = req.app.get("socketio");

      // ✅ Tambahkan log di sini
      console.log("🚀 Emit notifikasi:terbaru dengan count =", count);

      io.emit("notifikasi:terbaru", {
        message: "Jumlah personil statusId=2 berubah",
        count,
      });

      res.status(200).json({ count });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
};
