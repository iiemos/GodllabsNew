import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

const NotificationContext = createContext({ notify: () => {} });

function NotificationList({ notifications, onClose }) {
  const { t } = useTranslation();

  return (
    <>
      {notifications.map((notification, index) => {
        const isError = notification.type === "error";
        const isSuccess = notification.type === "success";
        const bgClass = isError ? "bg-red-500/95" : isSuccess ? "bg-emerald-500/95" : "bg-blue-500/95";
        const icon = isError ? "mdi:alert-circle" : isSuccess ? "mdi:check-circle" : "mdi:information";
        const title = isError ? t("notification.title.error") : isSuccess ? t("notification.title.success") : t("notification.title.info");

        return (
          <div
            key={notification.id}
            className={`fixed right-4 z-[9999] max-w-md rounded-lg px-4 py-3 text-white shadow-lg backdrop-blur-sm ${bgClass}`}
            style={{ top: `${16 + index * 88}px` }}
          >
            <div className="flex items-start gap-3">
              <Icon icon={icon} width="20" className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-sm opacity-95">{notification.message}</p>
              </div>
              <button type="button" onClick={() => onClose(notification.id)} className="rounded p-1 transition hover:bg-black/20">
                <Icon icon="mdi:close" width="16" />
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timersRef = useRef(new Map());

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    ({ message, type = "info", duration = 2600 }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setNotifications((prev) => [...prev, { id, message, type }]);

      const timer = window.setTimeout(() => {
        removeNotification(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [removeNotification],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  useEffect(
    () => () => {
      for (const timer of timersRef.current.values()) {
        window.clearTimeout(timer);
      }
      timersRef.current.clear();
    },
    [],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationList notifications={notifications} onClose={removeNotification} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
