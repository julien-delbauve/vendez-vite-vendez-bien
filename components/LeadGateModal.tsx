"use client";

import { useState, FormEvent } from "react";
import { useLeadGate } from "@/lib/lead-gate-context";
import styles from "./LeadGateModal.module.css";

interface Props {
  citycode?: string;
  cityName?: string;
  propertyType?: string;
}

export default function LeadGateModal({ citycode, cityName, propertyType }: Props) {
  const { register } = useLeadGate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          citycode,
          cityName,
          propertyType,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Erreur serveur");
        return;
      }

      register();
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Accédez à toutes les données immobilières
          </h2>
          <p className={styles.subtitle}>
            Entrez votre email pour continuer à explorer les prix de vente
            {cityName ? ` à ${cityName}` : ""}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            autoFocus
            disabled={loading}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Envoi..." : "Accéder aux données"}
          </button>
        </form>

        <p className={styles.legal}>
          Pas de spam. Vos données restent confidentielles.
        </p>
      </div>
    </div>
  );
}
