import { Bell, LogOut } from "lucide-react";
import style from "./style/Navbar.module.css";
import { useRef, useState } from "react";
import useClickOutside from "../../hooks/useClickOutside";

  const notifications = [
    { id: 1, text: "Nuevo mensaje recibido", time: "Hace 5 minutos" },
    { id: 2, text: "Tarea completada", time: "Hace 1 hora" },
    { id: 3, text: "Recordatorio: Reunión a las 3 PM", time: "Hace 2 horas" },
  ];

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  useClickOutside(notificationsRef as React.RefObject<HTMLElement>, () => {
    setShowNotifications(false);
  });

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div
      className={`${style.navbar} flex items-center justify-between py-4 px-6`}
    >
      <div className="text-white font-bold text-xl">MiApp</div>
      <ul className="flex items-center gap-6">
        <li className="relative">
          <button
            onClick={toggleNotifications}
            className={`p-2 rounded-full relative ${style.notificationBtn}`}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className={style.notificationBadge}>
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={style.notificationsDropdown} ref={notificationsRef}>
              <div className={style.notificationsHeader}>
                <h3>Notificaciones ({notifications.length})</h3>
              </div>
              <ul className={style.notificationsList}>
                {notifications.map((notification) => (
                  <li key={notification.id} className={style.notificationItem}>
                    <p>{notification.text}</p>
                    <small>{notification.time}</small>
                  </li>
                ))}
              </ul>
              <div className={style.notificationsFooter}>
                <button>Ver todas</button>
              </div>
            </div>
          )}
        </li>

        <li>
          <button className={style.logoutButton}>
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
