import fs from "node:fs";
import path from "node:path";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

const CSV_PATH = "./fleets/aircraft-database-complete-2025-08.csv";
const JSON_PATH = "./fleets/fleets.json";

interface AircraftRecord {
    icao24: string;
    manufacturerName: string;
    model: string;
    owner: string;
    registration: string;
    selCal: string;
    serialNumber: string;
    typecode: string;
    country: string;
}

function convertCsvToJson(): void {
    const items = parseAircraftCsv();
    fs.writeFileSync(path.resolve(JSON_PATH), JSON.stringify(items, null, 2), "utf8");

    console.log(`✅ Saved ${items.length} items.`);
}

function parseAircraftCsv(): AircraftRecord[] {
    const raw = fs.readFileSync(path.resolve(CSV_PATH), "utf8");
    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);

    const normalized = lines.map((line) => line.replace(/'/g, '"').replace(/,,/g, ',"",').replace(/,$/, ',""'));

    const headers = normalized[0].split(",").map((h) => h.replace(/^"|"$/g, ""));

    const items: AircraftRecord[] = [];

    for (let i = 1; i < normalized.length; i++) {
        const parts = normalized[i].split(",").map((p) => p.trim().replace(/^"|"$/g, ""));

        const row: any = {};
        headers.forEach((key, idx) => {
            row[key] = parts[idx] ?? "";
        });

        if (!row.registration || row.registration.trim() === "") continue;

        const filtered: AircraftRecord = {
            icao24: row.icao24,
            model: row.model,
            manufacturerName: row.manufacturerName,
            owner: row.owner,
            registration: row.registration,
            selCal: row.selCal,
            serialNumber: row.serialNumber,
            typecode: row.typecode,
            country: countries.getAlpha2Code(row.country, "en") || row.country,
        };

        items.push(filtered);
    }

    return items;
}

convertCsvToJson();
