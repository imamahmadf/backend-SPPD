const axios = require("axios");
const qs = require("qs");

async function scrapeData(params) {
  if (!params.kt || !params.nomor || !params.seri) {
    throw new Error("Invalid parameters");
  }

  let adjustedSeri = params.seri;
  if (params.seri === "E") {
    adjustedSeri = "E-";
  } else if (/^E[PE]*$/.test(params.seri)) {
    adjustedSeri = params.seri;
  }

  const payload = { ...params, seri: adjustedSeri };
  const response = await axios.post(
    "http://simpator.kaltimprov.go.id/cari.php",
    qs.stringify(payload),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    }
  );

  const html = response.data;

  const extractInputValue = (id) => {
    const regex = new RegExp(
      `<input[^>]+id=["']${id}["'][^>]+value=["']?([^"' >]+(?:\\s+[^"' >]+)*)["']?[^>]*>`,
      "i"
    );
    const match = html.match(regex);
    return match ? match[1].trim() : "";
  };

  return {
    nopol: extractInputValue("nopol"),
    tg_pkb: extractInputValue("tg_pkb"),
    tg_stnk: extractInputValue("tg_stnk"),

    total: extractInputValue("total"),
  };
}

module.exports = { scrapeData };
