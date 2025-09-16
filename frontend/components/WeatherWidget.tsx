"use client";
import { useState, useEffect, useRef } from "react";
import { deleteWidget, getWeatherData } from "@/utils/api";
import { WeatherData } from "@/utils/types";
import styles from "./WeatherWidget.module.css";

interface WeatherWidgetProps {
  id: string;
  location: string;
  onWidgetDeleted: (id: string) => void;
  refreshToken: number;
}

export default function WeatherWidget({
  id,
  location,
  onWidgetDeleted,
  refreshToken,
}: WeatherWidgetProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"confirm" | "result">("confirm");
  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const modalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setIsLoadingWeather(true);
        setWeatherError(null);
        const data = await getWeatherData(id);
        setWeatherData(data);
      } catch (error) {
        setWeatherError(
          error instanceof Error ? error.message : "Failed to load weather data"
        );
      } finally {
        setIsLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [id, refreshToken]);

  useEffect(() => {
    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
    };
  }, []);

  const formatLastUpdated = (cachedAt: string) => {
    const cached = new Date(cachedAt);

    if (Number.isNaN(cached.getTime())) {
      return "unknown";
    }

    return cached.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLocation = (value: string) =>
    value.replace(/\b\w+/g, (word) => {
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    });

  const startAutoClose = (shouldRemove: boolean) => {
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
    }

    modalTimerRef.current = setTimeout(() => {
      closeModal(shouldRemove);
    }, 3000);
  };

  const openModal = () => {
    if (isDeleting) {
      return;
    }

    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = null;
    }

    setModalView("confirm");
    setModalMessage("");
    setModalType("success");
    setIsModalOpen(true);
  };

  const closeModal = (shouldRemove: boolean = false) => {
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = null;
    }

    setIsModalOpen(false);
    setModalView("confirm");
    setModalMessage("");
    setModalType("success");
    setIsDeleting(false);

    if (shouldRemove) {
      onWidgetDeleted(id);
    }
  };

  const confirmDelete = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    setModalView("result");
    setModalMessage("Deleting widget...");
    setModalType("success");

    try {
      const response = await deleteWidget(id);
      const message = response?.message || "Widget deleted successfully";
      setModalMessage(message);
      setModalType("success");
      startAutoClose(true);
    } catch (error) {
      console.error("Error deleting widget:", error);
      const message =
        error instanceof Error ? error.message : "Failed to delete widget";
      setModalMessage(message);
      setModalType("error");
      setIsDeleting(false);
      startAutoClose(false);
    }
  };

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h4 className={styles.title}>{formatLocation(location)}</h4>
        <button
          className={styles.deleteButton}
          onClick={openModal}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <div className={styles.content}>
        {isLoadingWeather && (
          <div className={styles.loading}>
            <p>Loading weather data...</p>
          </div>
        )}

        {weatherError && (
          <div className={styles.error}>
            <p>⚠️ {weatherError}</p>
          </div>
        )}

        {weatherData && !isLoadingWeather && (
          <div className={styles.weatherInfo}>
            <div className={styles.temperature}>
              {weatherData.temperature}°C
            </div>
            <div className={styles.description}>{weatherData.description}</div>
            <div className={styles.lastUpdated}>
              Last updated: {formatLastUpdated(weatherData.cachedAt)}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.backdrop} role="presentation">
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-modal-${id}`}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() =>
                closeModal(modalView === "result" && modalType === "success")
              }
              aria-label="Close"
            >
              ×
            </button>

            {modalView === "confirm" ? (
              <>
                <h5 id={`delete-modal-${id}`} className={styles.modalTitle}>
                  Delete {formatLocation(location)} widget?
                </h5>
                <p className={styles.modalDescription}>
                  This action cannot be undone. Do you want to proceed?
                </p>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.modalCancel}
                    onClick={() => closeModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.modalConfirm}
                    onClick={confirmDelete}
                    disabled={isDeleting}
                  >
                    Confirm
                  </button>
                </div>
              </>
            ) : (
              <div
                className={`${styles.modalMessage} ${
                  modalType === "success"
                    ? styles.modalMessageSuccess
                    : styles.modalMessageError
                }`}
              >
                <span>{modalMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
