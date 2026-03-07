import Papa from "papaparse";
import { computeStats } from "./compute-stats";
import { DVFResult, Transaction } from "./types";

// Geolocalized DVF dataset
const GEO_DVF_BASE = "https://files.data.gouv.fr/geo-dvf/latest/csv";
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];

interface DVFRow {
  id_mutation: string;
  date_mutation: string;
  nature_mutation: string;
  valeur_fonciere: string;
  adresse_numero: string;
  adresse_nom_voie: string;
  code_postal: string;
  code_commune: string;
  nom_commune: string;
  type_local: string;
  surface_reelle_bati: string;
  surface_terrain: string;
  nombre_pieces_principales: string;
  longitude: string;
  latitude: string;
  id_parcelle: string;
}

async function fetchYearCSV(
  year: number,
  dept: string,
  citycode: string
): Promise<DVFRow[]> {
  const url = `${GEO_DVF_BASE}/${year}/communes/${dept}/${citycode}.csv`;

  try {
    const response = await fetch(url);
    if (!response.ok) return []; // 404 = year not available yet
    const text = await response.text();

    const result = Papa.parse<DVFRow>(text, {
      header: true,
      skipEmptyLines: true,
    });

    return result.data;
  } catch {
    return [];
  }
}

function mapPropertyType(typeLocal: string | null): string | null {
  if (!typeLocal) return "Terrain";
  if (typeLocal === "Dépendance") return null; // duplicate of parent transaction
  if (typeLocal === "Local industriel. commercial ou assimilé") return "Commercial";
  return typeLocal;
}

function rowToTransaction(row: DVFRow): Transaction | null {
  const price = parseFloat(row.valeur_fonciere);
  if (!price || price <= 0) return null;

  const propertyType = mapPropertyType(row.type_local || null);
  if (!propertyType) return null; // filtered out (e.g. Dépendance)
  const isLand = propertyType === "Terrain";
  const surface = isLand
    ? (parseFloat(row.surface_terrain) || 0)
    : (parseFloat(row.surface_reelle_bati) || 0);

  return {
    date: row.date_mutation || "",
    address: [row.adresse_numero, row.adresse_nom_voie]
      .filter(Boolean)
      .join(" "),
    propertyType,
    surface,
    price,
    pricePerSqm: surface > 0 ? price / surface : 0,
    rooms: parseInt(row.nombre_pieces_principales) || undefined,
    lat: parseFloat(row.latitude) || undefined,
    lon: parseFloat(row.longitude) || undefined,
    idParcelle: row.id_parcelle || undefined,
  };
}

export async function getDVFData(
  citycode: string,
  cityName: string
): Promise<DVFResult> {
  const dept = citycode.substring(0, 2);

  // Fetch all years in parallel
  const yearResults = await Promise.all(
    YEARS.map((year) => fetchYearCSV(year, dept, citycode))
  );

  const allRows = yearResults.flat();
  const seenMutations = new Set<string>();
  const allTransactions: Transaction[] = [];
  let maxDate = "";

  for (const row of allRows) {
    if (row.nature_mutation !== "Vente") continue;
    if ((row.type_local || "").normalize("NFC").toLowerCase().includes("pendance")) continue;

    const key = `${row.id_mutation}-${row.type_local}-${row.surface_reelle_bati}`;
    if (seenMutations.has(key)) continue;
    seenMutations.add(key);

    if (row.date_mutation && row.date_mutation > maxDate) {
      maxDate = row.date_mutation;
    }

    const tx = rowToTransaction(row);
    if (tx) allTransactions.push(tx);
  }

  const stats = computeStats(allTransactions);

  return {
    ...stats,
    totalTransactions: allTransactions.length,
    transactions: allTransactions.sort((a, b) => (b.date > a.date ? 1 : -1)),
    cityName,
    departmentCode: dept,
    dataFreshness: maxDate,
  };
}
