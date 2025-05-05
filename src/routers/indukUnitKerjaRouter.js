const express = require("express");
const { indukUnitKerjaControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/:id", indukUnitKerjaControllers.getIndukUnitKerja);
routers.post(
  "/delete/ttd-surat-tugas/:id",
  indukUnitKerjaControllers.deleteTtdSuratTugas
);
routers.post(
  "/delete/tanda-tangan",
  indukUnitKerjaControllers.deleteTandaTangan
);

routers.post(
  "/update/ttd-surat-tugas",
  indukUnitKerjaControllers.updateTtdSuratTugas
);

routers.post(
  "/update/tanda-tangan",
  indukUnitKerjaControllers.updateTandaTangan
);

routers.post("/post/tanda-tangan", indukUnitKerjaControllers.postTandaTangan);

routers.post("/post/unit-kerja", indukUnitKerjaControllers.postUnitKerja);
routers.post(
  "/post/ttd-surat-tugas",
  indukUnitKerjaControllers.postTtdSuratTugas
);

routers.get("/get", indukUnitKerjaControllers.getDaftarIndukUnitKerja);
routers.post("/post", indukUnitKerjaControllers.postIndukUnitKerja);
module.exports = routers;
