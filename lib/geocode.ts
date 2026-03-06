import { AddressSuggestion } from "./types";

const BAN_API_URL = "https://api-adresse.data.gouv.fr/search";

export async function searchAddress(
  query: string,
  limit: number = 5
): Promise<AddressSuggestion[]> {
  if (!query || query.length < 3) return [];

  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    type: "housenumber",
  });

  const response = await fetch(`${BAN_API_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`BAN API error: ${response.status}`);
  }

  const data = await response.json();

  return data.features.map(
    (feature: {
      properties: {
        label: string;
        citycode: string;
        city: string;
        postcode: string;
        housenumber?: string;
        street?: string;
      };
      geometry: { coordinates: [number, number] };
    }) => ({
      label: feature.properties.label,
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
      citycode: feature.properties.citycode,
      city: feature.properties.city,
      postcode: feature.properties.postcode,
      housenumber: feature.properties.housenumber,
      street: feature.properties.street,
    })
  );
}
