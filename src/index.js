require("dotenv/config");
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const { join, dirname } = require("path");

const { env } = require("./config");
const {
  perjalananRouter,
  pegawaiRouter,
  kwitansiRouter,
  dalamKotaRouter,
  rillRouter,
  userRouter,
  templateRouter,
  adminRouter,
  klasifikasiRouter,
  tujuanRouter,
  indukUnitKerjaRouter,
  pajakRouter,
  keuanganRouter,
  nomorSuratRouter,
  subKegiatanRouter,
  rekapRouter,
  sijakaRouter,
  notifikasiRouter,
  kendaraanRouter,
  usulanPegawaiRouter,
} = require("./routers");

const PORT = process.env.PORT || 8000;
const app = express();

// BUAT HTTP SERVER UNTUK SOCKET.IO
const server = http.createServer(app);

// INISIALISASI SOCKET.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.WHITELISTED_DOMAIN
      ? process.env.WHITELISTED_DOMAIN.split(",")
      : "*",
    methods: ["GET", "POST"],
  },
});

// SIMPAN io ke dalam app supaya bisa dipakai di controller
app.set("socketio", io);

// LOGIC SOCKET
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // Contoh listener event dari client
  socket.on("ping", () => {
    console.log("📡 Ping diterima dari client");
    socket.emit("pong");
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ===========================
// MIDDLEWARE
app.use(
  cors({
    origin: process.env.WHITELISTED_DOMAIN
      ? process.env.WHITELISTED_DOMAIN.split(",")
      : "*",
  })
);

app.use(express.json());
app.use("/api", express.static(`${__dirname}/public`));

// ===========================
// ROUTES API
app.use("/api/perjalanan", perjalananRouter);
app.use("/api/pegawai", pegawaiRouter);
app.use("/api/kwitansi", kwitansiRouter);
app.use("/api/dalam-kota", dalamKotaRouter);
app.use("/api/rill", rillRouter);
app.use("/api/user", userRouter);
app.use("/api/template", templateRouter);
app.use("/api/admin", adminRouter);
app.use("/api/klasifikasi", klasifikasiRouter);
app.use("/api/tujuan", tujuanRouter);
app.use("/api/induk-unit-kerja", indukUnitKerjaRouter);
app.use("/api/pajak", pajakRouter);
app.use("/api/keuangan", keuanganRouter);
app.use("/api/nomor-surat", nomorSuratRouter);
app.use("/api/sub-kegiatan", subKegiatanRouter);
app.use("/api/sijaka", sijakaRouter);
app.use("/api/rekap", rekapRouter);
app.use("/api/notifikasi", notifikasiRouter);
app.use("/api/kendaraan", kendaraanRouter);
app.use("/api/usulan", usulanPegawaiRouter);

app.get("/api", (req, res) => {
  res.send(`Hello, this is my API`);
});

app.get("/api/greetings", (req, res, next) => {
  res.status(200).json({
    message: "Hello, guys !",
  });
});

// ===========================
// ERROR HANDLING

app.use((req, res, next) => {
  if (req.path.includes("/api/")) {
    res.status(404).send("Not found !");
  } else {
    next();
  }
});

app.use((err, req, res, next) => {
  if (req.path.includes("/api/")) {
    console.error("Error : ", err.stack);
    res.status(500).send("Error !");
  } else {
    next();
  }
});

// ===========================
// MULAIKAN SERVER
server.listen(PORT, (err) => {
  if (err) {
    console.log(`❌ ERROR: ${err}`);
  } else {
    console.log(`✅ APP RUNNING at ${PORT}`);
  }
});
