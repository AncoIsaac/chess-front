import { Link } from "react-router";
import style from "./style/Sidebar.module.css";
import { House, Menu, Play } from 'lucide-react';

type SidebarProps = {
  toggleSidebar: () => void;
  isCollapsed: boolean;
};

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
  return (
    <header className={`${style.container} ${isCollapsed ? style.collapsed : ''}`}>
      <div className={style.container__div}>
        {!isCollapsed && <h1 className="text-white font-semibold">Nombre</h1>}
        <button
          type="button"
          onClick={toggleSidebar}
          className="text-white hover:bg-gray-700 rounded pl-0.5 transition-colors"
        >
          {isCollapsed ? (
            <Menu />
          ) : '←'}
        </button>
      </div>
      <nav className="pt-4">
        <ul>
          <li className="">
            <Link to={'/home'} className={`flex text-white items-center gap-3 hover:text-gray-400 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
              <House className="w-5 h-5 min-w-[20px]" />
              {!isCollapsed && <span className="whitespace-nowrap">Inicio</span>}
            </Link>,
          </li>
          <li className="">
            <Link to={'chess'} className={`flex text-white items-center gap-3 hover:text-gray-400 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
              <Play className="w-5 h-5 min-w-[20px]" />
              {!isCollapsed && <span className="whitespace-nowrap">Jugar</span>}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Sidebar
