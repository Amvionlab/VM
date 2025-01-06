import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import moment from 'moment';
import { toast } from "react-toastify";
import { baseURL, backendPort } from "../../config.js";
import { FaFilter, FaUserPlus } from "react-icons/fa";
import { MdSupervisedUserCircle } from "react-icons/md";
import { FaCircleUser } from "react-icons/fa6";
import { HiTicket } from "react-icons/hi2";
import * as XLSX from "xlsx";
import { tooltipClasses } from '@mui/material/Tooltip';
import jsPDF from "jspdf";
import { styled } from '@mui/material/styles';
import html2canvas from "html2canvas";
import ReactPaginate from "react-paginate";
import Select from "react-select";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, IconButton, TextField, MenuItem, TablePagination, Paper,  InputBase } from '@mui/material';


import {


  faRightFromBracket,
  faSquarePlus,
  faUserSecret,
  faUserTie,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Tooltip,
} from "@mui/material";
import { UserContext } from "../UserContext/UserContext";
import { useTicketContext } from "../UserContext/TicketContext";
import "./singleticket.css";

const SingleTicket = () => {
  const { ticketId } = useTicketContext();
  
 
  const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 900,
      backgroundColor: 'black',
    },
  });
  const id = ticketId;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const offset = page * rowsPerPage;
  const [ticketData, setTicketData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [statuses, setStatuses] = useState([]);
  const [status, setStatus] = useState([]);
  const [Accesses, setAccesses] = useState([]);
  const { user } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);


  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users2, setUsers2] = useState([]);
  const [filteredUsers2, setFilteredUsers2] = useState([]);

  const [filters, setFilters] = useState({});
  const [showFilter, setShowFilter] = useState({
    id: false,
    name: false,
    statusfrom: false,
  });
  const [showTimesheet, setShowTimesheet] = useState(true);
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    from_time: "",
    to_time: "",
    tid: id,

  });
  const totalUsers = users.length;
  const totalUsers2 = users2.length;
  const [showForm, setShowForm] = useState(false);

  const [ticketsPerPage, setTicketsPerPage] = useState(10);
  let i = 1;
  let j = 1;
  const [currentPage, setCurrentPage] = useState(0);
  const [ticketsPerPage2, setTicketsPerPage2] = useState(10);
  const [currentPage2, setCurrentPage2] = useState(0);
  const [addEntry, setAddEntry] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const fetchAllData = async () => {
    try {
      const response = await fetch(`${baseURL}backend/timesheet.php?id=${id}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    try {
      const response2 = await fetch(`${baseURL}backend/log.php?id=${id}`);
      const data2 = await response2.json();
      setUsers2(data2);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };
  const handleRowsPerPageChange2 = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  useEffect(() => {
    if (users.length) {
      const updatedFilteredUsers = users.filter((user) => {
        // Apply your filtering logic based on `filters` state
        return true; // Adjust as per your actual filtering needs
      });
      setFilteredUsers(updatedFilteredUsers);
    }
  }, [users, filters]); // Update filteredUsers whenever users or filters change

  const handleFilterChange = (e, field, type) => {
    const value = e.target.value.toLowerCase();
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: { type, value },
    }));
  };

  useEffect(() => {
    let filtered = [...users];
    Object.keys(filters).forEach((field) => {
      const { type, value } = filters[field];
      if (value) {
        filtered = filtered.filter((ticket) => {
          const fieldValue = ticket[field];

          if (fieldValue == null) {
            if (type === "contain" || type === "equal to") return false;
            if (type === "not contain") return true; if (type === "more than" || type === "less than") return false;
          }

          const fieldValueStr = fieldValue.toString().toLowerCase();
          const valueStr = value.toLowerCase();

          if (type === "contain")
            return fieldValueStr.includes(valueStr);
          if (type === "not contain")
            return !fieldValueStr.includes(valueStr);
          if (type === "equal to")
            return fieldValueStr === valueStr;
          if (type === "more than")
            return parseFloat(fieldValue) > parseFloat(value);
          if (type === "less than")
            return parseFloat(fieldValue) < parseFloat(value);
          return true;
        });
      }
    });
    setFilteredUsers(filtered);
  }, [filters, users]);

  useEffect(() => {
    let filtered = [...users2];
    Object.keys(filters).forEach((field) => {
      const { type, value } = filters[field];
      if (value) {
        filtered = filtered.filter((ticket) => {
          const fieldValue = ticket[field];

          if (fieldValue == null) {
            if (type === "contain" || type === "equal to") return false;
            if (type === "not contain") return true; if (type === "more than" || type === "less than") return false;
          }

          const fieldValueStr = fieldValue.toString().toLowerCase();
          const valueStr = value.toLowerCase();

          if (type === "contain")
            return fieldValueStr.includes(valueStr);
          if (type === "not contain")
            return !fieldValueStr.includes(valueStr);
          if (type === "equal to")
            return fieldValueStr === valueStr;
          if (type === "more than")
            return parseFloat(fieldValue) > parseFloat(value);
          if (type === "less than")
            return parseFloat(fieldValue) < parseFloat(value);
          return true;
        });
      }
    });
    setFilteredUsers2(filtered);
  }, [filters, users2]);

  const exportCSV = () => {
    // Get table headers
    const tableHeaders = Array.from(document.querySelectorAll(".filter-table .header .head"))
      .map(header => header.textContent.trim());

    // Get table data values
    const tableData = Array.from(document.querySelectorAll(".filter-table tr")).map(row =>
      Array.from(row.querySelectorAll("td")).map(cell => cell.textContent.trim())
    );

    // Filter out rows that contain filter content
    const filteredTableData = tableData.filter(row =>
      !row.some(cell => cell.includes("Contains") || cell.includes("Does Not Contain") || cell.includes("Equal To") || cell.includes("More Than") || cell.includes("Less Than"))
    );

    // Create CSV content
    const csvContent = [
      tableHeaders.join(","),
      ...filteredTableData.map(row => row.join(","))
    ].join("\n");

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Timesheet.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const exportExcel = () => {
    const table = document.querySelector('.filter-table');
    if (!table) return;

    // Extract table headers
    const headers = Array.from(document.querySelectorAll(".header .head")).map(header => header.textContent.trim());

    // Extract table data values
    const rows = Array.from(table.querySelectorAll('tbody tr')).map(row =>
      Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim())
    );

    // Filter out rows that contain filter content
    const filteredRows = rows.filter(row =>
      !row.some(cell => cell.includes("Contains") || cell.includes("Does Not Contain") || cell.includes("Equal To") || cell.includes("More Than") || cell.includes("Less Than"))
    );

    const data = [headers, ...filteredRows];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'Timesheet.xlsx');
  };


  const exportPDF = () => {
    const table = document.querySelector('.filter-table');
    if (!table) return;

    // Create a copy of the table
    const tableClone = table.cloneNode(true);

    // Remove filter dropdowns and inputs from the cloned table
    tableClone.querySelectorAll('.filter').forEach(filter => filter.remove());

    // Center-align all table cell contents
    tableClone.querySelectorAll('th, td').forEach(cell => {
      cell.style.textAlign = 'center';
    });

    // Append the cloned table to the body (temporarily)
    document.body.appendChild(tableClone);

    // Use html2canvas to convert the cloned table to an image
    html2canvas(tableClone).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('Timesheet.pdf');

      // Remove the cloned table from the document
      document.body.removeChild(tableClone);
    });
  };



  const exportCSV1 = () => {
    // Get table headers
    const tableHeaders = Array.from(document.querySelectorAll(".filter-table1 .header .head"))
      .map(header => header.textContent.trim());

    // Get table data values
    const tableData = Array.from(document.querySelectorAll(".filter-table1 tr")).map(row =>
      Array.from(row.querySelectorAll("td")).map(cell => cell.textContent.trim())
    );

    // Filter out rows that contain filter content
    const filteredTableData = tableData.filter(row =>
      !row.some(cell => cell.includes("Contains") || cell.includes("Does Not Contain") || cell.includes("Equal To") || cell.includes("More Than") || cell.includes("Less Than"))
    );

    // Create CSV content
    const csvContent = [
      tableHeaders.join(","),
      ...filteredTableData.map(row => row.join(","))
    ].join("\n");

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const exportExcel1 = () => {
    const table = document.querySelector('.filter-table1');
    if (!table) return;

    // Extract table headers
    const headers = Array.from(document.querySelectorAll(".header .head")).map(header => header.textContent.trim());

    // Extract table data values
    const rows = Array.from(table.querySelectorAll('tbody tr')).map(row =>
      Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim())
    );

    // Filter out rows that contain filter content
    const filteredRows = rows.filter(row =>
      !row.some(cell => cell.includes("Contains") || cell.includes("Does Not Contain") || cell.includes("Equal To") || cell.includes("More Than") || cell.includes("Less Than"))
    );

    const data = [headers, ...filteredRows];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'Log.xlsx');
  };


  const exportPDF1 = () => {
    const table = document.querySelector('.filter-table1');
    if (!table) return;

    // Create a copy of the table
    const tableClone = table.cloneNode(true);

    // Remove filter dropdowns and inputs from the cloned table
    tableClone.querySelectorAll('.filter').forEach(filter => filter.remove());

    // Center-align all table cell contents
    tableClone.querySelectorAll('th, td').forEach(cell => {
      cell.style.textAlign = 'center';
    });

    // Append the cloned table to the body (temporarily)
    document.body.appendChild(tableClone);

    // Use html2canvas to convert the cloned table to an image
    html2canvas(tableClone).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('Log.pdf');

      // Remove the cloned table from the document
      document.body.removeChild(tableClone);
    });
  };

  const currentTickets = users.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  
  



  const currentTickets2 = rowsPerPage > 0
  ? users2.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  : users; // Show all users when 'All' is selected


  const handleSubmit = async (e) => {
    e.preventDefault();
    const fromTime = new Date(`1970-01-01T${formData.from_time}:00`);
    const toTime = new Date(`1970-01-01T${formData.to_time}:00`);

    if (editMode) {
      // Update entry
      try {
        if (toTime <= fromTime) {
          toast.error("Wrong time period !");
        } else {
          let totalHours = (toTime - fromTime) / 3600000;
          let integerPart = Math.floor(totalHours);
          let fractionalPart = totalHours - integerPart;
          fractionalPart *= 0.6;
          totalHours = integerPart + fractionalPart;
          console.log(totalHours);

          const dataToSubmit = {
            ...formData,
            done_by: user.userId,
            total_hours: totalHours.toFixed(2),
          };
          console.log("edit data", dataToSubmit);

          const response = await fetch(`${baseURL}backend/timesheet-edit.php`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSubmit),
          });

          if (!response.ok) {
            throw new Error('Failed to update entry');
          }

          toast.success("Entry Edited");
          setAddEntry(false);
          setEditMode(false);
          fetchAllData();
          setFormData({
            date: '',
            description: '',
            from_time: '',
            to_time: '',
          });
        }
      }
      catch (error) {
        console.error('Failed to update entry', error);
      }
    }
    else {
      console.log(fromTime);
      console.log(toTime);

      if (toTime <= fromTime) {
        toast.error("Wrong time period !");
      } else {
        let totalHours = (toTime - fromTime) / 3600000;
        let integerPart = Math.floor(totalHours);
        let fractionalPart = totalHours - integerPart;
        fractionalPart *= 0.6;
        totalHours = integerPart + fractionalPart;
        console.log(totalHours);

        const dataToSubmit = {
          ...formData,
          userid: user.userId,
          tid: id,
          total_hours: totalHours.toFixed(2),
        };
        console.log("entry", dataToSubmit);
        try {
          const response = await fetch(`${baseURL}backend/timesheet.php`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSubmit),
          });

          const result = await response.json();

          if (result.success) {
            toast.success("Entry added successfully!");
            setFormData({
              date: "",
              description: "",
              from_time: "",
              to_time: "",
              tid: id,
              userid: user.userId
            });
            fetchAllData();
          } else {
            toast.error("Failed to add entry.");
          }
        } catch (error) {
          console.error("Error adding entry:", error);
          toast.error("An error occurred while adding entry.");
        }
      }
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${baseURL}backend/dropdown.php`);
      const data = await response.json();
      setAccesses(data.Support);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${baseURL}backend/get_status.php`);
      const data = await response.json();
      const formattedStatus = data.map((item) => ({ subName: item.status }));
      setStatus(formattedStatus);
    } catch (error) {
      console.error("Error fetching status data:", error);
      fetchStatus();
    }
  };

  const fetchTicket = async () => {
    try {
      const response = await fetch(
        `${baseURL}backend/getticket.php?id=${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch ticket data");
      }
      const data = await response.json();

      if (data.message) {
        toast.error(data.message);
      } else {
        setTicketData(data);
        // Update currentStep based on ticketData.status
        const statusIndex = status.findIndex(
          (s) => s.subName === data.status
        );
        setCurrentStep(data.status - 1);
      }
    } catch (error) {
      toast.error(`Error fetching ticket details: ${error.message}`);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await fetch(`${baseURL}backend/get_status.php`);
      if (!response.ok) {
        throw new Error("Failed to fetch statuses");
      }
      const data = await response.json();
      setStatuses(data);
    } catch (error) {
      console.log(`Error fetching statuses: ${error.message}`);
      location.reload();
    }
  };
  useEffect(() => {
    fetchTicket();
    fetchStatuses();
    fetchStatus();
    fetchData();
  }, [id]);


  const handleEdit = (user) => {
    console.log("edit :", user);
    setFormData({
      id: user.id,
      date: user.date,
      description: user.description,
      from_time: user.starttime,
      to_time: user.endtime,
      total_hours: user.totalhours,

    });
    setEditMode(true);
    setAddEntry(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        const response = await fetch(`${baseURL}backend/timesheet-delete.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete entry');
        } else {
          toast.success("Entry Deleted");
          fetchAllData();
        }
      } catch (error) {
        console.error('Failed to delete entry', error);
      }
    }
  };

  // Usage
  <FontAwesomeIcon icon={faTrashAlt} className="cursor-pointer text-red-500" onClick={() => handleDelete(user.id)} />



  const [selectedOptions, setSelectedOptions] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        const response = await fetch(
          `${baseURL}backend/get_assignees.php?id=${id}`
        );
        const result = await response.json();

        console.log("Assignees fetched:", result.assignees);
        console.log("Accesses:", Accesses);

        const options = result.assignees
          .map((assigneeId) => {
            const assignee = Accesses.find(
              (access) => access.id === assigneeId
            );
            return assignee
              ? { value: assignee.id, label: assignee.name }
              : null;
          })
          .filter((option) => option !== null);

        console.log("Options set:", options);

        setSelectedOptions(options);
      } catch (error) {
        console.error("Failed to fetch assignees", error);
      }
    };

    if (Accesses.length > 0) {
      fetchAssignees();
    }
  }, [id, Accesses]);

  const handleSelectChange = (selected) => {
    setSelectedOptions(selected || []);
  };

  const updateAssignees = async (newAssignees) => {
    const data = {
      id: id,
      assignees: newAssignees.map((option) => option.value),
      done: user.userId,
    };
    try {
      const response = await fetch(`${baseURL}backend/assign.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error("Failed to update assignees", error);
    }
  };

  const handleChipRemove = (option) => {
    const newOptions = selectedOptions.filter((o) => o.value !== option.value);
    setSelectedOptions(newOptions);
    updateAssignees(newOptions);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    updateAssignees(selectedOptions);
  };

  const logStatusChange = async (fromStatus, toStatus) => {
    try {
      const response = await fetch(
        `${baseURL}backend/log_ticket_movement.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            tid: id,
            from_status: fromStatus,
            to_status: toStatus,
            done_by: user.userId
          }),
        }
      );

      if (response.ok) {
        console.log(`Movement logged for Ticket ID: ${id}`);
      } else {
        console.error("Failed to log movement");
      }
    } catch (error) {
      console.error("Error logging movement:", error);
    }
  };

  const handleStepClick = (step) => {
    setSelectedStep(step);
    setOpen(true);
  };

  const assignConfirm = async () => {
    const newStatus = 2;
    console.log(newStatus);
    const oldStatus = ticketData?.status;
    console.log(oldStatus);
    if (oldStatus != 2) {
      try {
        // Update ticket status
        const response = await fetch(`${baseURL}backend/update_sstatus.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: id, status: newStatus }),
        });
        if (!response.ok) {
          throw new Error("Failed to update status");
        }
        const data = await response.json();
        toast.success(data.message);

        // Log the status change
        await logStatusChange(oldStatus, newStatus);

        // Update local state after successful status update
        setTicketData((prevTicketData) => ({
          ...prevTicketData,
          status: newStatus,
        }));
        setCurrentStep(selectedStep);
        setOpen(false);
        fetchTicket();

      } catch (error) {
        toast.error(`Error updating status: ${error.message}`);
      }
    }
  };

  const handleConfirm = async () => {
    const newStatus = statuses[selectedStep]?.id;
    const oldStatus = ticketData?.status;

    try {
      // Update ticket status
      const response = await fetch(`${baseURL}backend/update_sstatus.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id, status: newStatus }),
      });
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      const data = await response.json();
      toast.success(data.message);

      // Log the status change
      await logStatusChange(oldStatus, newStatus);

      // Update local state after successful status update
      setTicketData((prevTicketData) => ({
        ...prevTicketData,
        status: newStatus,
      }));
      setCurrentStep(selectedStep);
      setOpen(false);
    } catch (error) {
      toast.error(`Error updating status: ${error.message}`);
    }
  };

  if (!ticketData || statuses.length === 0) {
    return <div className="flex justify-center items-center">Loading...</div>;
  }

  const customerDetails = [
    { label: "Employee", value: ticketData.ticket_customer_value},
    { label: "Location", value: ticketData.customer_location },
    { label: "Department", value: ticketData.customer_department },
    { label: "Place", value: ticketData.contact_person },
    { label: "Contact No", value: ticketData.contact_number },
    { label: "Email ID", value: ticketData.contact_mail },
  ];

  const ticketDetails = [
    { label: "Catagory", value: ticketData.ticket_noc_value },
    { label: "Sub Catagory", value: ticketData.ticket_type_value },
    { label: "Type of Issue", value: ticketData.ticket_service_value },
    { label: "Division", value: ticketData.ticket_domain_value },
    { label: "Sub Division", value: ticketData.ticket_subdomain_value },
    { label: "Severity", value: ticketData.ticket_sla_value },
  ];

  const handleButtonClick = () => {
    setAddEntry(true);
  };

  return (
    <div className="bg-second h-full overflow-hidden p-0.5 font-sui">
      {user && user.ticketaction === "1" && (
        <div className=" progress-container w-full bg-box  h-[15%] mb-0.5">
          <div className="bar bg-second ">
            <div
              className="bar__fill bg-flo"
              style={{
                width: `${(currentStep + 1) * (100 / status.length)}%`,
              }}
            ></div>
          </div>
          {status.map((status, index) => (
            <div
              key={index}
              className={`point ${index <= currentStep ? "point--complete" : ""
                } ${index === currentStep ? "point--active" : ""}`}
              onClick={() => handleStepClick(index)}
            >
              <div className="bullet bg-prime"></div>
              <div className="label">{status.subName}</div>
            </div>
          ))}
        </div>
      )}

      {/* <div className="progress-container w-full mb-3 pt-5 bg-box font-poppins shadow-md"></div> */}
      <div className="overflow-y-scroll h-[85%] -mb-0.5">
      <div className="w-full mx-auto bg-box ">
        <div className="py-2 px-7 flex justify-between items-center bg-white rounded">
          <div className="flex items-center gap-1 text-prime font-bold">
            <HiTicket className="text-flo text-6xl" />
            <span className="text-base"> #{ticketData.id}</span>
            
      
            <CustomTooltip
      title={
        <div style={{ height: '350px', width: '900px', overflowY: 'auto' }} className="p-4">
          {/* Example content */}
          <pre className="text-wrap">{ticketData.issue_nature}</pre>
         
        </div>
      }
      
    >      
            <span className="w-full whitespace-nowrap overflow-hidden overflow-ellipsis" title={ticketData.issue_nature}> - {ticketData.issue_nature}</span>
            </CustomTooltip>
            <span className="text-xs font-bold ml-4 text-nowrap">{ticketData.post_date}</span>
          </div>
          
            {(ticketData.path && ticketData.path !== '') && (
              <div className="flex items-center gap-2 ml-auto">
              <a
                href={ticketData.path}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-xs text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300 mr-4"
              >
                Attachment
              </a>
              </div>
            )}
           
          
          <div className="flex items-center gap-4">
            {/* <span className="text-lg flex items-center gap-2 font-poppins">
            <FaCircleUser className="text-flo text-xl" />
            <span>{ticketData.cname}</span>
          </span> */}
            <Link to="/dashboard">
              <FontAwesomeIcon
                className="text-[#ff3333] text-xl cursor-pointer"
                title="Back"
                icon={faRightFromBracket}
                rotation={180}
              />
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-2 pl-4 pb-4 m-1 bg-white rounded-b-lg">
          <div className={`flex flex-col lg:flex-row gap-3 ${user && user.assign === "1" && selectedOptions ? 'w-full lg:w-4/5' : 'w-full'}`}>
            {/* Customer Details */}
            <div className={`flex-1 ${user && user.assign === "1" && selectedOptions ? 'w-full lg:w-2/5' : 'w-full lg:w-1/2'}`}>
              <h2 className="text-lg text-center font-semibold mb-3 text-gray-900">Employee Details</h2>
              <div className="overflow-x-auto rounded px-2 py-3 items-center border">
                <table className="min-w-full divide-y divide-gray-200 font-sui">
                  <tbody>
                    {customerDetails.map((detail, index) => (
                      <tr key={index}>
                        <td className="text-sm font-semibold text-prime whitespace-nowrap w-[40%]">{detail.label}</td>
                        <td className=" text-xs text-gray-800 font-normal">{detail.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ticket Details */}
            <div className={`flex-1 ${user && user.assign === "1" && selectedOptions ? 'w-full lg:w-2/5' : 'w-full lg:w-1/2'}`}>
              <h2 className="text-lg font-semibold mb-3 text-center text-gray-900">Ticket Details</h2>
              <div className="overflow-x-auto rounded px-2 py-3 border font-sui">
                <table className="min-w-full">
                  <tbody>
                    {ticketDetails.map((detail, index) => (
                      <tr key={index}>
                        <td className="text-sm font-medium text-prime whitespace-nowrap w-[40%]">{detail.label}</td>
                        <td className="text-xs text-gray-800 font-normal">{detail.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Assignee Section */}
          {user && user.assign === "1" && selectedOptions ? (
            <div className="flex-col w-full lg:w-1/5 pr-4 pl-2 mr-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold ml-2  text-prime mb-3">Assignee</span>
                <button
                  type="button"
                  className="text-prime text-xl ml-3"
                  onClick={() => setIsModalOpen(true)}
                >
                  <MdSupervisedUserCircle className="text-prime text-2xl" />
                </button>
              </div>
            
              <div className="flex-nowrap overflow-x-auto bg-box rounded  gap-2 mb-3 p-1 pr-6 mr-4">
                {selectedOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center bg-blue-500 text-white text-xs rounded-full px-2 py-1 whitespace-nowrap w-full mb-2"
                  >
                    <span title={option.label} className="flex-grow text-xs cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap w-[90%]">
                      {option.label}
                    </span>
                    <button
                      type="button"
                      className="flex-shrink-0 w-[10%] ml-2 text-black font-bold hover:text-gray-300"
                      onClick={() => handleChipRemove(option)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              
              </div>


              {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg h-auto shadow-lg w-11/12 sm:w-1/2 lg:w-1/3">
                    <h2 className="text-lg font-semibold mb-4">Select Assignees</h2>
                    <Select
  isMulti
  name="customer_department"
  options={Accesses.filter((access) => access.ttype === user.ttype).map((filteredAccess) => ({
    value: filteredAccess.id,
    label: filteredAccess.name,
  }))}
  classNamePrefix="select"
  className="text-xs bg-second border p-1 border-none rounded-md outline-none focus:border-bgGray focus:ring-bgGray"
  onChange={(selectedOptions) => {
    handleSelectChange(selectedOptions);
    assignConfirm();
  }}
  value={selectedOptions}
  placeholder="Select Department"
/>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        className="bg-red-500 text-white px-4 py-2 rounded-md"
                        onClick={handleModalClose}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>

              )}
            </div>
          ) : null}
        </div>

      </div>
      {addEntry && (
        <div className="fixed w-[100%] h-[100%] bg-black/70 top-0 left-0 z-10 items-center justify-center">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg h-auto shadow-lg w-11/12  lg:w-2/3">
            <form onSubmit={handleSubmit} className="mb-4 flex items-center flex-col">
              <div className="grid grid-cols-4 gap-4 bg-white p-5 rounded-md">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    required
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="from_time" className="block text-sm font-medium text-gray-700">
                    From Time
                  </label>
                  <input
                    type="time"
                    id="from_time"
                    name="from_time"
                    required
                    value={formData.from_time}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="to_time" className="block text-sm font-medium text-gray-700">
                    To Time
                  </label>
                  <input
                    type="time"
                    id="to_time"
                    name="to_time"
                    required
                    value={formData.to_time}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex items-center mt-4 gap-2 rounded-md">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700"
                >
                  {editMode ? 'Update Entry' : 'Add Entry'}
                </button>
                <div
                  onClick={() => {
                    setAddEntry(false);
                    setEditMode(false);
                    setFormData({
                      id: '',
                      date: '',
                      description: '',
                      from_time: '',
                      to_time: '',
                      total_hours: '',
                      done_by: '',
                    });
                  }}
                  className="gap-1 flex items-center bg-[red] px-4 py-2 rounded-md text-white cursor-pointer"
                >
                  <span>Cancel</span>
                  <FontAwesomeIcon icon={faXmark} className="text-xl text-white" />
                </div>
              </div>
            </form>
          </div>
        </div>

      )}

      <div className="max-w-full w-full bg-box p-3 rounded text-xs">
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={() => setShowTimesheet(true)}
            className={` font-semibold text-sm py-1 px-4 rounded-md shadow-md focus:outline-none ${showTimesheet ? 'bg-flo text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Timesheet
          </button>
          <button
            onClick={() => setShowTimesheet(false)}
            className={` font-semibold text-sm py-1 px-4 rounded-md shadow-md focus:outline-none ${!showTimesheet ? 'bg-flo text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Log
          </button>
        </div>

        {showTimesheet ? (
  <div className="ticket-table px-2">
    <div className="flex justify-between items-center border-b pb-2">
      <div>
        <p className="flex items-center">
          <span className="text-lg font-bold">Timesheet</span>
          <button
            onClick={handleButtonClick}
            className="ml-2 px-3 py-1 bg-prime text-box font-medium rounded hover:bg-prime-dark focus:outline-none focus:ring-2 focus:ring-prime-light focus:ring-opacity-75 transition duration-150 ease-in-out"
          >
            ADD +
          </button>
        </p>
      </div>
      <TablePagination
        sx={{ borderBottom: 'none' }}
        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
        colSpan={3}
        count={totalUsers}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleRowsPerPageChange}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
      />
      <div className="flex items-center space-x-1">
        <button
          onClick={() => exportCSV(filteredUsers)}
          className="bg-flo font-semibold text-xs text-white py-1 px-3 rounded-md shadow-md focus:outline-none"
        >
          CSV
        </button>
        <button
          onClick={() => exportExcel(filteredUsers)}
          className="bg-flo font-semibold text-xs text-white py-1 px-3 rounded-md shadow-md focus:outline-none"
        >
          Excel
        </button>
        <button
          onClick={() => exportPDF(filteredUsers)}
          className="bg-flo font-semibold text-xs text-white py-1 px-3 rounded-md shadow-md focus:outline-none"
        >
          PDF
        </button>
      </div>
    </div>

    <Table sx={{ width: '100%', borderRadius: 1, overflow: 'hidden' }}>
      <TableHead>
        <TableRow>
          {["Id", "Name", "Date", "Description", "Start", "End", "Total Hours", "Action"].map((header, index) => (
            <TableCell key={index} sx={{ py: 1, px: 2, textAlign: 'left', borderColor: 'divider' }}>
              <div className="flex items-center gap-1 font-bold">
                <span>{header}</span>
              </div>
              {showFilter[header.toLowerCase().replace(" ", "")] && (
                <div className="mt-1 bg-prime p-1 rounded">
                  <TextField
                    select
                    onChange={(e) => handleFilterChange(e, header.toLowerCase().replace(" ", ""), e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="contain">Contains</MenuItem>
                    <MenuItem value="not contain">Does Not Contain</MenuItem>
                    <MenuItem value="equal to">Equal To</MenuItem>
                    <MenuItem value="more than">More Than</MenuItem>
                    <MenuItem value="less than">Less Than</MenuItem>
                  </TextField>
                  <TextField
                    type="text"
                    placeholder="Enter value"
                    onChange={(e) =>
                      handleFilterChange(
                        e,
                        header.toLowerCase().replace(" ", ""),
                        filters[header.toLowerCase().replace(" ", "")]?.type || "contain"
                      )
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </div>
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {currentTickets.map((user, index) => (
          <TableRow key={user.id} hover>
            <TableCell sx={{ py: 1, px: 2, textAlign: 'left', borderColor: 'divider' }}>
              {(index + 1) + (page * rowsPerPage)}
            </TableCell>
            <TableCell sx={{ py: 1, px: 2, textAlign: 'left', borderColor: 'divider' }}>{user.name}</TableCell>
            <TableCell sx={{ py: 1, px: 2, textAlign: 'left', borderColor: 'divider' }}>{user.date}</TableCell>
            <TableCell sx={{ py: 1, px: 2, textAlign: 'left', borderColor: 'divider' }}>{user.description}</TableCell>
            <TableCell sx={{ py: 1, px: 2, textAlign: 'left', borderColor: 'divider' }}>{user.starttime}</TableCell>
            <TableCell sx={{ py: 1, px: 2, textAlign: 'left', borderColor: 'divider' }}>{user.endtime}</TableCell>
            <TableCell sx={{ py: 1, px: 2, textAlign: 'left', borderColor: 'divider' }}>{user.totalhours}</TableCell>
            <TableCell sx={{ py: 1, px: 2, textAlign: 'left', borderColor: 'divider' }}>
              <IconButton onClick={() => handleEdit(user)}>
                <FontAwesomeIcon icon={faEdit} className="text-blue-500 text-sm" />
              </IconButton>
              <IconButton onClick={() => handleDelete(user.id)}>
                <FontAwesomeIcon icon={faTrashAlt} className="text-red-500 text-sm" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
) : (
  <div className="ticket-table px-2">
    <div className="flex justify-between items-center border-b pb-2">
      <div>
        <h2 className="text-xl font-bold text-prime">Log</h2>
      </div>
      <TablePagination
        sx={{ borderBottom: 'none' }}
        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
        colSpan={3}
        count={totalUsers2}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleRowsPerPageChange2}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
      />
      <div className="flex items-center space-x-1">
        <button
          onClick={() => exportCSV1(filteredUsers2)}
          className="bg-flo font-semibold text-xs text-white py-1 px-3 rounded-md shadow-md focus:outline-none"
        >
          CSV
        </button>
        <button
          onClick={() => exportExcel1(filteredUsers2)}
          className="bg-flo font-semibold text-xs text-white py-1 px-3 rounded-md shadow-md focus:outline-none"
        >
          Excel
        </button>
        <button
          onClick={() => exportPDF1(filteredUsers2)}
          className="bg-flo font-semibold text-xs text-white py-1 px-3 rounded-md shadow-md focus:outline-none"
        >
          PDF
        </button>
      </div>
    </div>

    <Table sx={{ minWidth: 750 }}>
      <TableHead>
        <TableRow>
          {["Id", "Name", "Status From", "Status To", "Post Date"].map((header, index) => (
            <TableCell key={index} align="center" sx={{ py: 1, px: 2, textAlign: 'left', borderColor: 'divider' }}>
              <div className="flex items-center justify-center font-bold">
                <span>{header}</span>
              </div>
              {showFilter[header.toLowerCase().replace(" ", "")] && (
                <div className="mt-1 p-1 bg-gray-100 rounded">
                  <Select
                    fullWidth
                    value={filters[header.toLowerCase().replace(" ", "")]?.type || "contain"}
                    onChange={(e) =>
                      handleFilterChange(e, header.toLowerCase().replace(" ", ""), e.target.value)
                    }
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <MenuItem value="contain">Contains</MenuItem>
                    <MenuItem value="not contain">Does Not Contain</MenuItem>
                    <MenuItem value="equal to">Equal To</MenuItem>
                    <MenuItem value="more than">More Than</MenuItem>
                    <MenuItem value="less than">Less Than</MenuItem>
                  </Select>
                  <InputBase
                    placeholder="Enter value"
                    fullWidth
                    sx={{ mt: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}
                    onChange={(e) =>
                      handleFilterChange(e, header.toLowerCase().replace(" ", ""), filters[header.toLowerCase().replace(" ", "")]?.type || "contain")
                    }
                    inputProps={{ style: { fontSize: '0.875rem' } }}
                  />
                </div>
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {currentTickets2.map((user, i) => (
          <TableRow key={user.id} hover>
            <TableCell sx={{ py: 1, px: 2, textAlign: 'center', borderColor: 'divider' }}>{i + 1 + page * rowsPerPage}</TableCell>
            <TableCell sx={{ py: 1, px: 2, textAlign: 'center', borderColor: 'divider' }}>{user.name}</TableCell>
            <TableCell sx={{ py: 1, px: 2, textAlign: 'center', borderColor: 'divider' }}>{user.statusfrom}</TableCell>
            <TableCell sx={{ py: 1, px: 2, textAlign: 'center', borderColor: 'divider' }}>{user.statusto}</TableCell>
            <TableCell sx={{ py: 1, px: 2, textAlign: 'center', borderColor: 'divider' }}>{user.post_date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)}


      </div>

      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Change Ticket Status"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to change the ticket status to{" "}
            {status[selectedStep]?.subName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SingleTicket;
