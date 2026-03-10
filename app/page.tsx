import AddressSearch from "@/components/AddressSearch";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.glow} />
      <div className={styles.hero}>
        <p className={styles.badge}>Landes &middot; Pays Basque &middot; Sud-Ouest</p>
        <h1 className={styles.title}>
          Le <span className={styles.accent}>vrai prix</span> de
          <br />
          l&apos;immobilier dans le Sud-Ouest
        </h1>
        <p className={styles.subtitle}>
          Un outil mis à votre disposition afin d&apos;analyser les prix réels
          des dernières transactions par commune.
          <br />
          Utile également pour comparer votre estimation avec les ventes officielles.
        </p>
        <div className={styles.searchWrapper}>
          <AddressSearch />
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>3 ans</span>
            <span className={styles.statLabel}>de données</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>100%</span>
            <span className={styles.statLabel}>officiel</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>2 500+</span>
            <span className={styles.statLabel}>communes du Sud-Ouest</span>
          </div>
        </div>
      </div>
      <footer className={styles.footer}>
        Source :{" "}
        <a
          href="https://www.data.gouv.fr/fr/datasets/5cc1b94a634f4165e96436c1/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Demandes de Valeurs Foncières (DVF)
        </a>{" "}
        — Ministère de l&apos;Économie
      </footer>
    </main>
  );
}
