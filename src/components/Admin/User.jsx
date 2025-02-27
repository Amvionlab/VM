import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { baseURL } from '../../config.js';
import { FaFilter } from "react-icons/fa";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  IconButton,
  TablePagination
} from "@mui/material";
import html2canvas from 'html2canvas';
import { UserContext } from '../UserContext/UserContext';

const Form = () => {
  const [formData, setFormData] = useState({
    username: "",
    employee_id: "",
    password: "",
    department: "",
    usertype: "",
  });
  const { user } = useContext(UserContext);
  const [ticketsPerPage, setTicketsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  let i = 1;

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filters, setFilters] = useState({});
  const [showFilter, setShowFilter] = useState({
    id: false,
    name: false,
    lastname: false,
  });

  const [showForm, setShowForm] = useState(false);
  const [access, setAccess] = useState([]);
  const [employee, setEmployee] = useState([]);

  useEffect(() => {
    const generatePassword = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let password = '';
      for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
      }
      return password;
    };

    setFormData(prevState => ({
      ...prevState,
      password: generatePassword()
    }));
  }, []);

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const response = await fetch(`${baseURL}/backend/fetchAccess.php`);
        const data = await response.json();
        setAccess(data);
      } catch (error) {
        console.error("Error fetching access:", error);
      }
    };

    const fetchEmployee = async () => {
      try {
        const response = await fetch(`${baseURL}/backend/fetchEmployees.php`);
        const data = await response.json();
        setEmployee(data);
      } catch (error) {
        console.error("Error fetching access:", error);
      }
    };
console.log("emp",employee)
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${baseURL}/backend/fetchUsers.php`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAccess();
    fetchUsers();
    fetchEmployee();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  
    if (name === "usertype") {
      handleUserTypeChange(value);
    }
  };  

  // Handle user type selection logic
  const handleUserTypeChange = async (usertype) => {
    // Find user type name from the access array if usertype is an ID
    const selectedType = access.find((accessItem) => accessItem.id === usertype)?.name;
  
    if (selectedType === "Manager" || selectedType === "Support") {
      setShowDepartmentDropdown(true);
      await fetchDepartments(); // Fetch departments if not already loaded
    } else {
      setShowDepartmentDropdown(false);
      setFormData((prev) => ({ ...prev, department: "" })); // Reset department field
    }
  };  

  const navigate = useNavigate();

  const handleRowsPerPageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setTicketsPerPage(!isNaN(value) && value >= 1 ? value : 1);
    setCurrentPage(0);
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${baseURL}/backend/fetchTicket_type.php`);
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    document.body.classList.add('cursor-wait', 'pointer-events-none');
    
    // Create a new FormData object
    const form = new FormData();
    for (const key in formData) {
        // Append each form data key-value pair to the FormData object
        form.append(key, formData[key]);
    }

    // Log the form values before submission
    console.log("Form Values:");
    for (const [key, value] of form.entries()) {
        console.log(`${key}: ${value}`);
    }

    try {
      // Indicate loading state
      document.body.classList.add('cursor-wait', 'pointer-events-none');
    
      const response = await fetch(`${baseURL}/backend/user_add.php`, {
        method: "POST",
        body: form,
      });
    
      const result = await response.json();
      alert(result.message)
      // Check for various success conditions
      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }
    
      if (result.success) {
        // Check if the email was sent successfully
        if (result.message.includes("email sent")) {
          toast.success(result.message);
        } else if (result.message.includes("email could not be sent")) {
          toast.success(result.message);
        }
      } else {
        // Handle known back-end error scenarios
        toast.error(result.message);
      }
    
      // Remove loading indicators
      document.body.classList.remove('cursor-wait', 'pointer-events-none');
    
      // Optionally, redirect or refresh the page
      if (result.success) {
        window.location.reload();
      }
    
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error adding user. " + error.message);
      document.body.classList.remove('cursor-wait', 'pointer-events-none');
    }
};

  const pageCount = Math.ceil(filteredUsers.length / ticketsPerPage);

  const handleFilterChange = (e, field, type) => {
    const value = e.target.value.toLowerCase();
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: { type, value }
    }));
  };

  useEffect(() => {
    let filtered = [...users];
    Object.keys(filters).forEach((field) => {
      const { type, value } = filters[field];
      if (value) {
        filtered = filtered.filter((user) => {
          const fieldValue = user[field] || '';
          const fieldValueStr = fieldValue.toString().toLowerCase();
          if (type === "contain") return fieldValueStr.includes(value);
          if (type === "not contain") return !fieldValueStr.includes(value);
          if (type === "equal to") return fieldValueStr === value;
          if (type === "more than") return parseFloat(fieldValue) > parseFloat(value);
          if (type === "less than") return parseFloat(fieldValue) < parseFloat(value);
          return false;
        });
      }
    });
    setFilteredUsers(filtered);
  }, [filters, users]);

  const exportCSV = () => {
    const tableHeaders = Array.from(document.querySelectorAll(".header .head"))
      .map(header => header.textContent.trim());

    const tableData = Array.from(document.querySelectorAll("table tr")).map(row =>
      Array.from(row.querySelectorAll("td")).map(cell => cell.textContent.trim())
    );

    const filteredTableData = tableData.filter(row =>
      !row.some(cell => cell.includes("Contains") || cell.includes("Does Not Contain") || cell.includes("Equal To") || cell.includes("More Than") || cell.includes("Less Than"))
    );

    const csvContent = [
      tableHeaders.join(","),
      ...filteredTableData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    const table = document.querySelector('.filter-table');
    if (!table) return;

    const headers = Array.from(document.querySelectorAll(".header .head")).map(header => header.textContent.trim());
    const rows = Array.from(table.querySelectorAll('tbody tr')).map(row =>
      Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim())
    );

    const filteredRows = rows.filter(row =>
      !row.some(cell => cell.includes("Contains") || cell.includes("Does Not Contain") || cell.includes("Equal To") || cell.includes("More Than") || cell.includes("Less Than"))
    );

    const data = [headers, ...filteredRows];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'Analytics.xlsx');
  };

  const exportPDF = () => {
    const table = document.querySelector('.filter-table');
    if (!table) return;

    const tableClone = table.cloneNode(true);
    tableClone.querySelectorAll('.filter').forEach(filter => filter.remove());

    tableClone.querySelectorAll('th, td').forEach(cell => {
      cell.style.textAlign = 'center';
    });

    document.body.appendChild(tableClone);

    html2canvas(tableClone).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('Analytics.pdf');

      document.body.removeChild(tableClone);
    });
  };

  const offset = currentPage * ticketsPerPage;
  const currentTickets = filteredUsers.slice(offset, offset + ticketsPerPage);
  

  return (
    <div className="bg-second max-h-full h-full max-w-full text-xs mx-auto lg:overflow-y-hidden ticket-scroll">
      {showForm && (
  <div className="max-w-full w-full mt-3 m-1 mb-1 p-2 bg-box rounded-lg font-mont">
    <div className="ticket-table mt-2">
      <form onSubmit={handleSubmit} className="space-y-4 text-label">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 ml-10 pr-10 mb-0">
          <div className="text-lg font-bold text-prime mb-2 font-mont">
            User Details:
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-10 ml-10 pr-10 mb-0">

          {/* Employee Name Dropdown */}
          <div className="flex items-center mb-2 mr-4">
            <label className="text-sm font-semibold text-prime mr-2 w-32">
              Employee <span className="text-red-600 text-md font-bold">*</span>
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="selectbox flex-grow text-xs bg-box border w-32 p-3 rounded-md outline-none focus:border-bgGray focus:ring-bgGray focus:shadow-prime focus:shadow-sm"
            >
              <option value="" className="custom-option">
                Select Employee
              </option>
              {employee.map((employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                  className="custom-option"
                >
                  {employee.firstname} - {employee.employee_id}
                </option>
              ))}
            </select>
          </div>

          {/* Username Input */}
          <div className="flex items-center mb-2 mr-4">
            <label className="text-sm font-semibold text-prime mr-2 w-32">
              Username<span className="text-red-600 text-md font-bold">*</span>
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="flex-grow text-xs bg-box border p-3 rounded-md outline-none transition ease-in-out delay-150 focus:shadow-prime focus:shadow-sm"
            />
          </div>

          {/* User Type Dropdown */}
          <div className="flex items-center mb-2 mr-4">
            <label className="text-sm font-semibold text-prime mr-2 w-32 text-nowrap">
              User Type<span className="text-red-600 text-md font-bold">*</span>
            </label>
            <select required
  name="usertype"
  value={formData.usertype}
  onChange={handleChange}
  className="selectbox flex-grow text-xs bg-box border p-3 rounded-md outline-none focus:border-bgGray focus:ring-bgGray focus:shadow-prime focus:shadow-sm"
>
  <option value="" className="custom-option">
    Select User Type
  </option>
  {access.map((access) => (
    <option key={access.id} value={access.id} className="custom-option">
      {access.name}
    </option>
  ))}
</select>
          </div>

          {/* Department Dropdown - Conditional */}
          {showDepartmentDropdown && (
            <div className="flex items-center mb-2 mr-4">
              <label className="text-sm font-semibold text-prime mr-2 w-32">
                Department<span className="text-red-600 text-md font-bold">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="selectbox flex-grow text-xs bg-box border p-3 rounded-md outline-none focus:border-bgGray focus:ring-bgGray focus:shadow-prime focus:shadow-sm"
              >
                <option value="" className="custom-option">
                  Select Department
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id} className="custom-option">
                    {dept.type}
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="hover:bg-prime border-2 border-prime ml-4 font-sui font-bold text-xs text-prime hover:text-white py-1 px-3 rounded-md shadow focus:outline-none"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      <div className="max-w-full w-full h-full bg-box p-5 rounded-lg font-mont">
        <div className="ticket-table mt-4">
          <h3 className="text-lg font-bold text-prime mb-4 font-mont flex justify-between items-center">
            <span >
              User Data
              <button
                onClick={() => setShowForm(!showForm)}
                className="hover:bg-prime border-2 border-prime ml-4 font-sui font-bold text-xs text-prime hover:text-white py-1 px-3 rounded-md shadow focus:outline-none"
              >
                {showForm ? "Close" : "+ Add User"}
              </button>
            </span>
            <span className="text-xs gap-2">
            <TablePagination
  rowsPerPageOptions={[5, 10, 25]} // Options for rows per page
  component="div"
  count={filteredUsers.length} // Total number of rows
  rowsPerPage={ticketsPerPage} // Current rows per page
  page={currentPage} // Current page index
  onPageChange={(event, newPage) => setCurrentPage(newPage)} // Change page
  onRowsPerPageChange={(event) => {
    setTicketsPerPage(parseInt(event.target.value, 10)); // Update rows per page
    setCurrentPage(0); // Reset to first page
  }}
/>
</span>
<span className="flex gap-6">
              <button
                onClick={exportCSV}
                className="bg-second font-sui font-bold text-xs border hover:bg-flo hover:text-white transition-all ease-out py-1 px-3 rounded-md shadow-md focus:outline-none"
              >
                CSV
              </button>
              <button
                onClick={exportExcel}
                className="bg-second font-sui font-bold text-xs border hover:bg-flo hover:text-white transition-all ease-out py-1 px-3 rounded-md shadow-md focus:outline-none"
              >
                Excel
              </button>
              <button
                onClick={exportPDF}
                className="bg-second font-sui font-bold text-xs border hover:bg-flo hover:text-white transition-all ease-out py-1 px-3 rounded-md shadow-md focus:outline-none"
              >
                PDF
              </button>
              </span>
          </h3>
          <div className="overflow-x-auto">
         
      <Table className="min-w-full" aria-label="employee table">
        <TableHead className=" font-semibold font-poppins text-fontadd">
        <TableRow>
  {["Id", "Employee ID", "Employee Name", "Username", "User Type", "Mobile", "Location"].map((header, index) => (
    <TableCell key={index} className="py-4 px-4" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '10px 4px' }}>
      <div className="flex items-center justify-left gap-2">
        <div className="header flex">
          <span className="head font-bold">{header}</span>
        </div>
      </div>
    </TableCell>
  ))}
</TableRow>

        </TableHead>
        <TableBody>
          {currentTickets.map((userdet) => (
           <TableRow key={userdet.id} className="bg-box text-fontadd text-center font-medium">
           <TableCell style={{ padding: '10px 4px' }} className="border-t">
             {(i++) + offset}
           </TableCell>
           <TableCell style={{ padding: '2px 4px', textAlign: "left" }} className="border-t">
             {userdet.employee_id}
           </TableCell>
           <TableCell style={{ padding: '2px 4px', textAlign: "left" }} className="border-t">
             {userdet.employee_name}
           </TableCell>
           <TableCell style={{ padding: '2px 4px', textAlign: "left" }} className="border-t">
             {userdet.username}
           </TableCell>
           <TableCell style={{ padding: '2px 4px', textAlign: "left" }} className="border-t">
             {userdet.typename}
           </TableCell>
           <TableCell style={{ padding: '2px 4px', textAlign: "left" }} className="border-t">
             {userdet.mobile}
           </TableCell>
           <TableCell style={{ padding: '2px 4px', textAlign: "left" }} className="border-t">
             {userdet.location}
           </TableCell>
         </TableRow>
         
          ))}
        </TableBody>
      </Table>

        </div>
        </div>

     

      </div>
    </div>
  );
};

export default Form;


