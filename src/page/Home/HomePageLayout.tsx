import { Outlet } from "react-router";
import Sidebar from "../../components/Sidebar/Sidebar";
import {  useRef, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import useClickOutside from "../../hooks/useClickOutside";

const HomePageLayout = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  useClickOutside(sidebarRef as React.RefObject<HTMLElement>, () => {
    setIsSidebarVisible(false);
  });

  return (
    <header>
      <div
        ref={sidebarRef} 
      >
        <Sidebar
          toggleSidebar={toggleSidebar}
          isCollapsed={!isSidebarVisible}
        />
      </div>
      <main className="pl-22 w-full">
        <Navbar/>
        <section className='py-4 px-6 w-full  bg-amber-400'>
          <Outlet />
          hoal
        </section>
      </main>
    </header>
  );
};

export default HomePageLayout;
