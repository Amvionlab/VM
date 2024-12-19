import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../../config.js";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import html2canvas from "html2canvas";
import { UserContext } from "../UserContext/UserContext.jsx";

const Form = () => {
  const [formData, setFormData] = useState({
    domain_id: "",
    name: "",
  });
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [ticketsPerPage, setTicketsPerPage] = useState(10); // default to 10 rows per page
  const [currentPage, setCurrentPage] = useState(0);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [filters, setFilters] = useState({});
  const [showFilter, setShowFilter] = useState({
    id: false,
    name: false,
  });
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const domainResponse = await fetch(`${baseURL}backend/dropdown.php`);
        const domainData = await domainResponse.json();
        setDomains(domainData.domains);

        const userResponse = await fetch(`${baseURL}/backend/fetchSubDomain.php`);
        const userData = await userResponse.json();
        setUsers(userData);
        setFilteredUsers(userData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];
    const fileExtension = file ? file.name.split(".").pop().toLowerCase() : "";

    if (file && allowedExtensions.includes(fileExtension)) {
      setAttachment(file);
      setAttachmentError("");
    } else {
      setAttachment(null);
      setAttachmentError(
        "Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }
    if (attachment) {
      form.append("attachment", attachment);
    }

    try {
      const response = await fetch(`${baseURL}/backend/SubDomain_add.php`, {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }
      setSubmissionStatus({ success: true, message: result.message });
      toast.success("Domain added");
      window.location.reload();
    } catch (error) {
      setSubmissionStatus({
        success: false,
        message:
          "There was a problem with your fetch operation: " + error.message,
      });
    }
  };

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
            return type === "not contain";
          }
          const fieldValueStr = fieldValue.toString().toLowerCase();
          return {
            contain: () => fieldValueStr.includes(value),
            "not contain": () => !fieldValueStr.includes(value),
            "equal to": () => fieldValueStr === value,
            "more than": () => parseFloat(fieldValue) > parseFloat(value),
            "less than": () => parseFloat(fieldValue) < parseFloat(value),
          }[type]();
        });
      }
    });
    setFilteredUsers(filtered);
  }, [filters, users]);

  const exportCSV = () => {
    const csvContent = [
      columns.map(col => col.label).join(","),
      ...filteredUsers.map(row => columns.map(col => row[col.id]).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Sub_Domain.csv";
    link.click();
  };

  const exportExcel = () => {
    const data = filteredUsers.map((row) =>
      columns.map((column) => row[column.id] || "")
    );
    const worksheet = XLSX.utils.json_to_sheet([columns.map((c) => c.label), ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "Sub_Domain.xlsx");
  };

  const exportPDF = () => {
    const table = document.querySelector(".filter-table");
    if (!table) return;

    html2canvas(table).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("Sub_Domain.pdf");
    });
  };

  const columns = [
    { id: "id", label: "ID", minWidth: 100 },
    { id: "name", label: "Name", minWidth: 170 },
    { id: "domain_id", label: "Domain ID", minWidth: 170 },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="bg-second max-h-full w-full relative text-xs mx-auto p-1 h-auto ticket-scroll">
      {showForm && (
        <div className="w-full relative bg-box p-3 rounded-lg font-mont">
          <form onSubmit={handleSubmit} className="space-y-4 text-label">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 ml-10 pr-10 mb-0">
              <div className="text-lg font-bold text-prime mb-2">
                Sub Division Details:
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-x-10 ml-10 pr-10 mb-0">
              <div className="flex items-center mb-2 mr-4">
                <label className="text-sm font-semibold text-prime mr-2 w-32">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter Sub Division Name"
                  className="flex-grow text-xs bg-box border w-80 border-gray-400 p-2 outline-none transition ease-in-out delay-150"
                />
              </div>
              <div className="flex items-center mb-4 mr-4">
                <label className="text-sm font-semibold text-prime mr-2 w-32">
                  Domain
                </label>
                <select
                  name="domain_id"
                  value={formData.domain_id}
                  onChange={handleChange}
                  required
                  className="selectbox flex-grow text-xs bg-box border p-2 mt-1 outline-none focus:border-bgGray focus:ring-bgGray"
                >
                  <option value="">Select Domain</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="hover:bg-prime border-2 border-prime ml-8 font-sui font-bold text-xs text-prime hover:text-white py-1 px-3 rounded-md shadow focus:outline-none"
            >
              Submit
            </button>
          </form>
        </div>
      )}

      <div className="w-full h-full max-h-full relative m-0.5 bg-box p-3 rounded-lg font-mont">
        <div className="flex justify-end flex-wrap space-x-2 mt-4"></div>
        <div className="ticket-table mt-8">
          <h2 className="text-lg font-bold text-prime mb-2 flex justify-between items-center">
            <div>
              <span>Sub Division Data</span>
              <span className="items-end">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="hover:bg-prime border-2 border-prime ml-4 font-sui font-bold text-xs text-prime hover:text-white py-1 px-3 rounded-md shadow focus:outline-none"
                >
                  {showForm ? "Close" : "+ Add Sub Division"}
                </button>
              </span>
            </div>
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
            <div className="flex gap-6">
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
            </div>
          </h2>
          <TableContainer>
            <Table stickyHeader aria-label="sticky table" className="filter-table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align="center"
                      sx={{
                        minWidth: column.minWidth,
                        padding: "7px 8px",
                        fontSize: "15px",
                        fontWeight: "700",
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(currentPage * ticketsPerPage, currentPage * ticketsPerPage + ticketsPerPage)
                  .map((ticket) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={ticket.id}>
                      {columns.map((column) => {
                        const value = ticket[column.id];
                        return (
                          <TableCell key={column.id} align="center" sx={{ padding: "6px" }}>
                            {value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
         
        </div>
      </div>
    </div>
  );
};

export default Form;
