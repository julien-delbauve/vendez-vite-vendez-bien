import AddressSearch from "@/components/AddressSearch";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          vendez<span className={styles.accent}>vite</span>.fr
        </h1>
        <p className={styles.subtitle}>
          Estimez la valeur de votre bien immobilier en quelques secondes.
          <br />
          Données officielles des transactions immobilières en France.
        </p>
        <AddressSearch />
        <p className={styles.source}>
          Source : Demandes de Valeurs Foncières (DVF) — Ministère de
          l&apos;Économie
        </p>
      </div>
    </main>
  );
}
