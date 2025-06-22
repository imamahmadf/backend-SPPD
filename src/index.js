require("dotenv/config");
const express = require("express");
const cors = require("cors");
const { join, dirname } = require("path");
// const { sequelize } = require("./models"); // uncomment to use sequelize default utility
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
} = require("./routers");

const PORT = process.env.PORT || 8000;
const app = express();

app.use(
  cors({
    origin: process.env.WHITELISTED_DOMAIN
      ? process.env.WHITELISTED_DOMAIN.split(",")
      : "*",
  })
);

app.use(express.json());
app.use("/api", express.static(`${__dirname}/public`));

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
app.get("/api", (req, res) => {
  res.send(`Hello, this is my API`);
});

app.get("/api/greetings", (req, res, next) => {
  res.status(200).json({
    message: "Hello, guys !",
  });
});

// ===========================

// not found
app.use((req, res, next) => {
  if (req.path.includes("/api/")) {
    res.status(404).send("Not found !");
  } else {
    next();
  }
});

// error
app.use((err, req, res, next) => {
  if (req.path.includes("/api/")) {
    console.error("Error : ", err.stack);
    res.status(500).send("Error !");
  } else {
    next();
  }
});

//#endregion

//#region CLIENT
// const clientPath = "../../client/build";
// app.use(express.static(join(__dirname, clientPath)));

// // Serve the HTML page
// app.get("*", (req, res) => {
//   res.sendFile(join(__dirname, clientPath, "index.html"), (err) => {
//     if (err) {
//       console.error("Error sending index.html:", err);
//       res.status(err.status).end();
//     }
//   });
// });

//#endregion

app.listen(PORT, (err) => {
  if (err) {
    console.log(`ERROR: ${err}`);
  } else {
    console.log(`APP RUNNING at ${PORT} ✅`);
  }
});
