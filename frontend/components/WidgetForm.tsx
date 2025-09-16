"use client";
import styles from "./WidgetForm.module.css";

export default function WidgetForm() {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Add Weather Widget</h3>
      <form>
        <div className={styles.inputGroup}>
          <label htmlFor="location" className={styles.label}>
            Location:
          </label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="Enter city name (e.g., Berlin)"
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.button}>
          Add Widget
        </button>
      </form>
    </div>
  );
}
