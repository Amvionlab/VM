import React, { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faForward,
  faHouse,
  faListCheck,
  faChartPie,
  faWrench,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import logo from "../../image/S1.svg";

import { UserContext } from "../UserContext/UserContext";
import sampatName from "../../image/S2.svg";

const SideMenu = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();
  const { user } = useContext(UserContext);

  const menuItems = [
    { title: "Dashboard", icon: faHouse, to: "/dashboard", key: "dashboard" },
    { title: "New Tickets", icon: faListCheck, to: "/ticket", key: "ticket" },
    //{ title: "Reports", icon: faFileAlt, to: "/reports", key: "analytics" },
    {
      title: "Analytics",
      icon: faChartPie,
      to: "/analytics",
      key: "analytics",
    },
    { title: "Setup Wizard", icon: faWrench, to: "/setup", key: "creation" },
  ];

  const handleMouseEnter = (title) => setHoveredItem(title);
  const handleMouseLeave = () => setHoveredItem(null);

  return (
    <div className={`transition-all duration-500 ${isExpanded ? "sb-expanded" : ""}`}>
      <aside
        className="relative inset-y-0 z-50 h-full text-sui left-0 py-4 px-2 bg-prime transition-all duration-500 ease-in-out"
        style={{ width: isExpanded ? "12rem" : "4.5rem" }}
      >
        <nav className="h-full">
          <ul className="flex flex-col h-full gap-2">
            <li>
              <Link
                to="/"
                className="flex items-center transition-none whitespace-nowrap gap-2 p-2 pr-3 hover:text-prime text-white text-lg rounded-lg"
              >
                <img
                  src={logo}
                  width="40px"
                  height="50px"  
                  alt="Logo"
                  style={{ minWidth: "40px", minHeight: "50px" }}
                />
                {isExpanded && (
                  <img
                    src={sampatName}
                    alt="Sampat Name"
                    style={{ minWidth: "110px", height: "40px" }}
                  />
                )}
              </Link>
            </li>

            {menuItems.map(({ title, icon, to, key }) => (
              user &&
              user[key] === "1" && (
              <li key={title}>
                <Link
                  to={to}
                  onMouseEnter={() => handleMouseEnter(title)}
                  onMouseLeave={handleMouseLeave}
                  className={`flex items-center whitespace-nowrap gap-2 p-3 m-1 rounded-lg transition-all duration-500 ease-in-out 
                    ${location.pathname === to ? "bg-white text-prime" : "hover:bg-white hover:text-prime text-white"}`}
                >
                  <FontAwesomeIcon
                    className="text-md"
                    icon={icon}
                    style={{ minWidth: "24px", textAlign: "center" }} // Fixed width for icon
                  />
                  {isExpanded && (
                    <p className="text-xs font-medium transition-all duration-500 ease-in-out" style={{ minWidth: "100px" }}>
                      {title}
                    </p>
                  )}
                  {!isExpanded && hoveredItem === title && (
                    <p className="absolute z-50 left-20 p-1 rounded-md text-sm bg-flo text-white transition-opacity">
                      {title}
                    </p>
                  )}
                </Link>
              </li>
            )))}

            <li>
              <Link
                to="#"
                className={`flex items-center gap-2 p-3 m-1 mt-8 text-white rounded-lg transition-all duration-500 ease-in-out hover:bg-white hover:text-purple-500`}
                onClick={() => setIsExpanded(prev => !prev)}
              >
                <FontAwesomeIcon
                  className="transition-all duration-300"
                  icon={faForward}
                  style={{
                    minWidth: "24px",
                    textAlign: "center",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
                {isExpanded && (
                  <p className="text-xs font-medium transition-opacity">
                    Collapse
                  </p>
                )}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default SideMenu;
