export interface AddressSuggestion {
  label: string;
  lat: number;
  lon: number;
  citycode: string;
  city: string;
  postcode: string;
  housenumber?: string;
  street?: string;
}

export interface Transaction {
  date: string;
  address: string;
  propertyType: string;
  surface: number;
  price: number;
  pricePerSqm: number;
  rooms?: number;
  lat?: number;
  lon?: number;
  idParcelle?: string;
}

export interface YearlyStats {
  year: number;
  avgPrice: number;
  avgPricePerSqm: number;
  medianPrice: number;
  count: number;
}

export interface MonthlyStats {
  label: string; // "Jan 2024", "Fév 2024", etc.
  avgPrice: number;
  avgPricePerSqm: number;
  medianPrice: number;
  count: number;
}

export interface PropertyTypeStats {
  type: string;
  avgPrice: number;
  avgPricePerSqm: number;
  count: number;
}

export interface DVFResult {
  averagePrice: number;
  medianPrice: number;
  averagePricePerSqm: number;
  totalTransactions: number;
  byPropertyType: PropertyTypeStats[];
  byYear: YearlyStats[];
  transactions: Transaction[];
  cityName: string;
  departmentCode: string;
  dataFreshness: string;
}