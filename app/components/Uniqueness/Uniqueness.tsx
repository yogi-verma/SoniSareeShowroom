import { FiAward, FiRefreshCw, FiTruck } from "react-icons/fi";
import { TbRosetteDiscountCheck, TbSparkles } from "react-icons/tb";
import styles from "./Uniqueness.module.css";

const promises = [
  { title: "Free Shipping", detail: "Delivered with care", Icon: FiTruck },
  { title: "Easy Returns", detail: "A simple, easy process", Icon: FiRefreshCw },
  { title: "3,000+ Styles", detail: "Find your kind of beautiful", Icon: TbSparkles },
  { title: "Genuine Quality", detail: "Chosen by Soni, made to last", Icon: TbRosetteDiscountCheck },
];

function PromiseGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className={styles.group} aria-hidden={duplicate || undefined}>
      {promises.map(({ title, detail, Icon }) => (
        <div className={styles.promise} key={title}>
          <span className={styles.iconWrap}>
            <Icon className={styles.icon} aria-hidden="true" />
            {title === "3,000+ Styles" && <FiAward className={styles.iconAccent} aria-hidden="true" />}
          </span>
          <span className={styles.copy}>
            <span className={styles.title}>{title}</span>
            <span className={styles.detail}>{detail}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function Uniqueness() {
  return (
    <section className={styles.section} aria-label="The Soni promise">
      <div className={styles.viewport}>
        <div className={styles.track}>
          <PromiseGroup />
          <PromiseGroup duplicate />
          <PromiseGroup duplicate />
          <PromiseGroup duplicate />
        </div>
      </div>
    </section>
  );
}

export default Uniqueness;
