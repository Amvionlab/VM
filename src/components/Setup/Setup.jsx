import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faKey,
  faUser,
  faUsers,
  faBuilding,
  faGlobe,
  faSitemap,
  faMapMarkedAlt,
  faFlag,
  faTicketAlt,
  faTags,
  faHandsHelping
} from '@fortawesome/free-solid-svg-icons';

function Setup() {
  const navigate = useNavigate();

  const topics = {
    ADMIN: [
      { title: "Department", icon: <FontAwesomeIcon icon={faBuilding} />, path: "/admin/department" },
      { title: "Employees", icon: <FontAwesomeIcon icon={faUsers} />, path: "/admin/employee" },
      { title: "Access", icon: <FontAwesomeIcon icon={faKey} />, path: "/admin/access" },
      { title: "User", icon: <FontAwesomeIcon icon={faUser} />, path: "/admin/user" },
       ],
    BASIC: [
      { title: "Domain", icon: <FontAwesomeIcon icon={faGlobe} />, path: "/admin/domain" },
      { title: "Sub Domain", icon: <FontAwesomeIcon icon={faSitemap} />, path: "/admin/subdomain" },
      { title: "Branch", icon: <FontAwesomeIcon icon={faMapMarkedAlt} />, path: "/admin/location" },
      { title: "SLA", icon: <FontAwesomeIcon icon={faFlag} />, path: "/admin/sla" },
    ],
    TICKET: [
      { title: "Ticket Category", icon: <FontAwesomeIcon icon={faTags} />, path: "/admin/ticket_type" },
      { title: "Ticket Sub Category", icon: <FontAwesomeIcon icon={faTicketAlt} />, path: "/admin/ticket_noc" },
      { title: "Ticket Status", icon: <FontAwesomeIcon icon={faTicketAlt} />, path: "/admin/ticket_status" },
      { title: "Ticket Issue Type", icon: <FontAwesomeIcon icon={faHandsHelping} />, path: "/admin/ticket_service" },
    ]
  };

  return (
    <div className="w-full h-full bg-second p-1 font-sui text-sm">
      <div className="h-full bg-box p-2 pt-3">
        {Object.keys(topics).map((topic, index) => (
          <div key={topic} className="border-2 border-second rounded-lg bg-box p-4 mb-2">
            <h2 className="text-base font-bold text-prime mb-1">{topic}</h2>
            <div className="h-full p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
              {topics[topic].map((item, index) => (
                <div
                  key={index}
                  className="group cursor-pointer flex flex-row p-4 gap-4 items-center bg-box border rounded-xl transition-transform hover:shadow"
                  onClick={() => navigate(item.path)} 
                >
                  <span className={`text-flo text-md transition-transform transform group-hover:translate-x-1 group-hover:scale-125`}>
                    {item.icon}
                  </span>

                  <div className="flex flex-col transition-transform transform group-hover:font-medium">
                    <span className="font-bold text-prime text-md group-hover:text-flo">{item.title}</span>
                    <span className="text-gray-500 text-xs">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Setup;
