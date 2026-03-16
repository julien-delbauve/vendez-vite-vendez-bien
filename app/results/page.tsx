"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";
import { DVFResult } from "@/lib/types";
import Dashboard from "@/components/Dashboard";
import AddressSearch from "@/components/AddressSearch";
import styles from "./page.module.css";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<DVFResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const citycode = searchParams.get("citycode");
  const city = searchParams.get("city") || "";
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lon = parseFloat(searchParams.get("lon") || "0");

  useEffect(() => {
    if (!citycode) {
      setError("Aucune adresse sélectionnée");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/dvf?citycode=${encodeURIComponent(citycode)}&city=${encodeURIComponent(city)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((result) => {
        if (result.error) throw new Error(result.error);
        setData(result);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [citycode, city]);

  const handleSearchArea = useCallback(
    (newCitycode: string, newCityName: string, newLat: number, newLon: number) => {
      const params = new URLSearchParams({
        citycode: newCitycode,
        city: newCityName,
        lat: String(newLat),
        lon: String(newLon),
        address: newCityName,
      });
      router.push(`/results?${params.toString()}`);
    },
    [router]
  );

  return (
    <div className={styles.layout}>
      <div className={styles.topBar}>
        <div className={styles.searchBar}>
          <AddressSearch />
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.content}>
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Chargement des données DVF...</p>
              <p className={styles.loadingDetail}>
                Analyse du marché immobilier en cours...
              </p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <h3>Erreur</h3>
              <p>{error}</p>
              <a href="/" className={styles.backLink}>
                Retour à la recherche
              </a>
            </div>
          )}

          {data && !loading && (
            <Dashboard
              data={data}
              lat={lat}
              lon={lon}
              cityCode={citycode || undefined}
              onSearchArea={handleSearchArea}
            />
          )}
        </div>

        <footer className={styles.footer}>
          Source : Demandes de Valeurs Foncières (DVF) — Ministère de l&apos;Économie
          &middot; Données via{" "}
          <a
            href="https://www.data.gouv.fr/fr/datasets/5cc1b94a634f4165e96436c1/"
            target="_blank"
            rel="noopener noreferrer"
          >
            data.gouv.fr
          </a>
        </footer>
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.layout}>
          <main className={styles.main}>
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Chargement...</p>
            </div>
          </main>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
