import { Link } from "react-router";
import style from "./style/Sidebar.module.css";
import {   House, Menu, Play } from 'lucide-react';

type SidebarProps = {
    toggleSidebar: () => void;
    isCollapsed: boolean;
};

const Sidebar = ({isCollapsed, toggleSidebar}: SidebarProps) => {
  return (
    <header className={`${style.container} ${isCollapsed ? style.collapsed : ''}`}>
      <div >
        {!isCollapsed && <h1 className="text-white text-lg font-semibold">Nombre</h1>}
        <button
          type="button"
          onClick={toggleSidebar}
          className="text-white hover:bg-gray-700 rounded p-1 transition-colors"
        >
          {isCollapsed ? (
            <Menu/>
          ) : '←'} 
        </button>
      </div>
      <nav className="p-1">
        <ul>
          <li className="mb-4">
            <Link to={'/home'} className={`flex items-center gap-3 hover:text-gray-400 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
              <House className="w-5 h-5 min-w-[20px]" />
              {!isCollapsed && <span className="whitespace-nowrap">Inicio</span>}
            </Link>
          </li>
          <li className="mb-4">
            <Link to={'chess'} className={`flex items-center gap-3 hover:text-gray-400 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
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