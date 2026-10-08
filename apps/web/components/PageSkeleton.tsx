import styles from "./PageSkeleton.module.css";

type Variant = "home" | "catalog" | "product" | "checkout" | "account" | "auth" | "static";
const Blocks = ({ count, className = "" }: { count: number; className?: string }) => <>{Array.from({ length: count }, (_, index) => <div key={index} className={`${styles.pulse} ${className}`} />)}</>;

export function CatalogGridSkeleton() {
  return <div className={styles.grid} aria-label="Mahsulotlar yuklanmoqda"><Blocks count={8} className={`${styles.card} ${styles.pulse}`} /></div>;
}

export function PageSkeleton({ variant }: { variant: Variant }) {
  if (variant === "home") return <><div className={styles.bar} /><div className={styles.hero + " " + styles.pulse} /><main className={`container ${styles.shell}`}><div className={styles.promo}><Blocks count={2} className={styles.pulse} /></div><div className={styles.title + " " + styles.pulse} /><div className={styles.grid}><Blocks count={8} className={`${styles.card} ${styles.pulse}`} /></div></main></>;
  if (variant === "catalog") return <main className={`container ${styles.shell}`}><div className={styles.bar} /><div className={`${styles.title} ${styles.pulse}`} /><div className={styles.filters}><Blocks count={4} className={styles.pulse} /></div><CatalogGridSkeleton /></main>;
  if (variant === "product") return <main className={`container ${styles.shell} ${styles.product}`}><div className={`${styles.gallery} ${styles.pulse}`} /><div className={styles.details}><Blocks count={5} className={styles.pulse} /></div></main>;
  if (variant === "checkout") return <main className={`container ${styles.shell} ${styles.twoColumn}`}><div className={styles.rows}><Blocks count={4} className={`${styles.row} ${styles.pulse}`} /></div><div className={`${styles.side} ${styles.pulse}`} /></main>;
  if (variant === "account") return <main className={`container ${styles.shell} ${styles.account}`}><div className={`${styles.nav} ${styles.pulse}`} /><div className={styles.rows}><div className={`${styles.title} ${styles.pulse}`} /><Blocks count={3} className={`${styles.row} ${styles.pulse}`} /></div></main>;
  if (variant === "auth") return <main className={`container ${styles.shell}`}><div className={`${styles.auth} ${styles.pulse}`} /></main>;
  return <main className={`container ${styles.shell} ${styles.static}`}><div className={styles.bar} /><Blocks count={7} className={styles.pulse} /></main>;
}
