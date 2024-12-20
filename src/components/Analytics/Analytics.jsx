import React, { useContext, useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { baseURL } from "../../config.js";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TablePagination,
  Paper,
  TableSortLabel,
  FormControl,
  OutlinedInput,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { UserContext } from "../UserContext/UserContext.jsx";
import Chart from "react-google-charts";

function Reports() {
  const [tickets, setTickets] = useState([]); // Ensure this is an array
  const { user } = useContext(UserContext);
  const [page, setPage] = useState(0);
  const [ticketsPerPage, setTicketsPerPage] = useState(25);
  const [filteredTickets, setFilteredTickets] = useState([]); // Ensure this is an array, too.
  const [selectedFilter, setSelectedFilter] = useState("type");
  const [selectedLabels, setSelectedLabels] = useState([[], [], [], []]);

  const filters = [
    { item: "Type", title: "Category" },
    { item: "Status", title: "Status" },
    { item: "Assignees", title: "Assignees" },
    { item: "Domain", title: "Division" }
  ];

  const csvData = Array.isArray(filteredTickets) ? filteredTickets.map((ticket) => ({
    Id: ticket.id,
    Category: ticket.type,
    "Sub Catagory": ticket.nature_of_call,
    Status: ticket.status,
    Issue: ticket.service,
    Assignees: ticket.assignees,
    Location: ticket.customer_location,
    Division: ticket.domain,
    "Sub Division": ticket.subdomain,
    Severity: ticket.sla,
    "Raised Date": ticket.post_date,
    "Raised By": ticket.name,
    "Closed At": ticket.closed_date,
  })) : [];
  
  const header = ["id", "Category", "Sub Catagory", "Status","Issue", "Division", "Sub Division", "Severity", "Location", "Raised Date", "Raised By", "Assignees", "Closed At"];
  const Title = ["Ticket", "Category","Sub Catagory", "Status", "Division", "Sub Division", "Severity", "Location", "Raised Date", "Raised By", "Assignees","Closed Date"];
  const headers = ["id", "Type", "nature_of_call", "Status", "Domain", "Subdomain", "sla", "customer_location", "Post Date", "name", "Assignees", "closed_date"];
  
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        let response;
        if (user && user.accessId === "2") {
          response = await fetch(
            `${baseURL}backend/fetchTickets.php?user=${user.userId}`
          );
        } else if (user && user.accessId === "5") {
          response = await fetch(
            `${baseURL}backend/fetchTickets.php?support=${user.userId}&ttype=${user.ttype}`
          );
        } else if (user && user.accessId === "4") {
          response = await fetch(
            `${baseURL}backend/fetchTickets.php?manager=${user.userId}&ttype=${user.ttype}`
          );
        } else {
          response = await fetch(`${baseURL}backend/fetchTickets.php`);
        }
        const data = await response.json();

        if (Array.isArray(data)) {
          setTickets(data);
          setFilteredTickets(data); // Set both to ensure consistent state
        } else {
          setTickets([]);
          setFilteredTickets([]);
        }
      } catch (error) {
        console.error("Error fetching ticket data:", error);
        setTickets([]);
        setFilteredTickets([]);
      }
    };
    fetchTickets();
  }, [user]);
  
  const handleFilterChange = (index) => (event) => {
    const {
      target: { value },
    } = event;
    const updatedLabels = [...selectedLabels];
    updatedLabels[index] = typeof value === "string" ? value.split(",") : value;
    setSelectedLabels(updatedLabels);
  };

  const groupDataByField = (field, data) => {
    if (!Array.isArray(data)) return {};
    const groupedData = {};
    data.forEach((ticket) => {
      const value = ticket[field] || "Empty";
      groupedData[value] = (groupedData[value] || 0) + 1;
    });
    return groupedData;
  };

  const handlePageChange = (event, newPage) => setPage(newPage);
  const handleRowsPerPageChange = (event) => {
    setTicketsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    if (Array.isArray(tickets)) {
      setFilteredTickets(
        tickets.filter(ticket =>
          selectedLabels.every((labels, index) =>
            labels.length === 0 || labels.includes(ticket[["type", "status", "assignees", "domain"][index]])
          )
        )
      );
    }
  }, [selectedLabels, tickets]);

  const domainData = groupDataByField(selectedFilter, filteredTickets);

  const pieChartData = [["Category", "Count"]];
  Object.entries(domainData).forEach(([label, value]) => {
    pieChartData.push([label, value]);
  });

  const pieChartOptions = {
    legend: { textStyle: { fontSize: 12 } },
    pieSliceText: "value",
    title: ` Ticket Distribution`,
    is3D: true,
    pieSliceTextStyle: { fontSize: 20 },
    titleTextStyle: { fontSize: 18, color: "#000" },
  };

  return (
    <div className="bg-second p-0.5 h-full overflow-hidden gap-1">
      <div className="p-2 bg-box w-full flex justify-center items-center">
       
        <div className="flex justify-center items-center text-xs w-full gap-5 px-5">
          <p className="font-bold text-sm">Filter :</p>
          {filters.map(({ item, title }, index) => (
            <FormControl key={index} sx={{ m: 0.5, width: 150, height: 30 }}>
              <Select
                multiple
                displayEmpty
                value={selectedLabels[index]}
                onChange={handleFilterChange(index)}
                input={<OutlinedInput />}
                renderValue={(selected) => selected.length === 0 ? <span style={{ color: "#aaa" }}>Select {title}</span> : selected.join(", ")}
                MenuProps={{
                  PaperProps: { style: { maxHeight: 30 * 4.5 + 2, width: 180 } },
                }}
                sx={{ fontSize: "0.75rem", padding: "2px", height: 30 }}
              >
                {Object.entries(groupDataByField(item.toLowerCase(), tickets)).map(([label]) => (
                  <MenuItem key={label} value={label} sx={{ padding: "2px 4px", fontSize: "0.4rem" }}>
                    <Checkbox
                      checked={selectedLabels[index].includes(label)}
                      size="small"
                      sx={{ fontSize: "0.4rem" }} 
                    />
                    <ListItemText primary={label} sx={{ fontSize: "0.4rem" }} />
                  </MenuItem>
                ))}

              </Select>
            </FormControl>
          ))}
          <div
            className="font-semibold py-1 px-3 rounded border text-red-600 hover:bg-red-600 hover:text-white cursor-pointer"
            onClick={() => setSelectedLabels([[], [], [], []])}
          >
            <p className="text-xs">Clear All</p>
          </div>
        </div>
      </div>

      <div className="main flex h-[89%] gap-0.5 mt-0.5">
        <div className="section1 md:flex-col  w-[40%] bg-box rounded h-full">
          <div className="flex justify-center items-center gap-5 w-full p-2">
            {filters.map(({ item, title }, index) => (
              <div
                key={index}
                onClick={() => setSelectedFilter(item.toLowerCase())}
                className={`py-1 px-4 text-xs font-semibold rounded cursor-pointer ${
                  item.toLowerCase() === selectedFilter
                    ? "bg-flo text-white"
                    : "bg-box text-black border"
                }`}
                title={title}
              >
                <p>{title}</p>
              </div>
            ))}
          </div>

          <div className="w-full flex-col justify-start items-center h-full rounded flex mb-2">
            <Chart
              chartType="PieChart"
              width="100%"
              height="80%"
              data={pieChartData}
              options={pieChartOptions}
              chartEvents={[
                {
                  eventName: "select",
                  callback: ({ chartWrapper }) => {
                    const chart = chartWrapper.getChart();
                    const selection = chart.getSelection();
                  },
                },
              ]}
            />
          </div>
        </div>

        <div className="section2 w-full overflow-y-hidden h-full">
          <Paper className="bg-box p-1 rounded-xl border h-full">
            <div className="w-full border-b h-10 flex text-sm justify-between items-center font-medium mb-2">
              <div className="flex capitalize ml-2 mt-3 text-base">
                <p className="font-bold text-prime">Analytics</p>
              </div>
              <TablePagination
                component="div"
                sx={{
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "10px" },
                  "& .MuiTablePagination-select": { fontSize: "10px" },
                  "& .MuiTablePagination-actions": { fontSize: "10px" },
                  minHeight: "30px",
                  ".MuiTablePagination-toolbar": { minHeight: "30px", padding: "0 8px" },
                }}
                count={filteredTickets.length}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={ticketsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[10, 25, 50, 100, 500]}
              />
              <div className="flex gap-1">
                <CSVLink
                  data={csvData}
                  headers={header}
                  filename={"tickets.csv"}
                  className="bg-box transform hover:scale-110 transition-transform duration-200 ease-in-out border-2 text-prime text-xs font-semibold py-1 px-3 rounded m-2"
                >
                  CSV
                </CSVLink>
              </div>
            </div>
            <TableContainer sx={{ maxHeight: "calc(100vh - 160px)" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {Title.map((header, index) => (
                      <TableCell
                        key={index}
                        align="center"
                        sx={{
                          whiteSpace: "nowrap",
                          fontWeight: "300",
                          fontSize: "14px",
                          padding: "4px",
                          backgroundColor: "#004080",
                          color: "white",
                        }}
                      >
                        <TableSortLabel
                          sx={{
                            "&.Mui-active": { color: "white" },
                            "&:hover": { color: "white" },
                            "& .MuiTableSortLabel-icon": { color: "white !important" },
                          }}
                        >
                          {header}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody className="py-10">
                  {filteredTickets.length === 0 ? (
                    <TableRow hover>
                      <TableCell
                        colSpan={headers.length} // Ensures the message spans all columns
                        sx={{
                          padding: "2px",
                          fontSize: "14px",
                          textAlign: "center",
                        }}
                      >
                        You don't have tickets.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets
                      .slice(page * ticketsPerPage, page * ticketsPerPage + ticketsPerPage)
                      .map((ticket) => (
                        <TableRow key={ticket.id} hover>
                          {headers.map((header, idx) => (
                            <TableCell
                              key={idx}
                              align="left"
                              sx={{
                                padding: "3px",
                                fontSize: "11px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                cursor: "pointer",
                                "&:hover": {
                                  whiteSpace: "normal",
                                  backgroundColor: "#f5f5f5",
                                },
                              }}
                              title={ticket[header.toLowerCase().replace(' ', '_')] || (header === 'Assignees' && "N/A")}
                            >
                              {header === 'Assignees' ?
                                (ticket.assignees?.split(" ").slice(0, 3).join(" ") || "N/A") +
                                (ticket.assignees?.split(" ").length > 3 ? "..." : "")
                                : ticket[header.toLowerCase().replace(' ', '_')]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default Reports;
