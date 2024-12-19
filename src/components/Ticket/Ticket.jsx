import React, { useState, useEffect, useContext } from "react";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { baseURL } from '../../config.js';
import { UserContext } from '../UserContext/UserContext';

const Form = () => {

  const [ticketTypes, setTicketTypes] = useState([]);
  const [ticketnoc, setTicketnoc] = useState([]);
  const [ticketsla, setTicketsla] = useState([]);
  const [ticketServices, setTicketServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [domains, setDomains] = useState([]);
  const [subDomains, setSubDomains] = useState([]);
  const [locations, setLocations] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [formData, setFormData] = useState({}); // Initialize as empty object

  const { user } = useContext(UserContext);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}backend/dropdown.php`);
        const data = await response.json();
        setTicketTypes(data.ticketTypes);
        setTicketnoc(data.ticketnoc);
        setTicketsla(data.ticketsla);
        setCustomers(data.customers);
        setDepartments(data.departments);
        setDomains(data.domains);
        setSubDomains(data.subDomains);
        setLocations(data.locations);
        setTicketServices(data.ticketServices);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (customers.length > 0) {
      const selectedCustomer = customers.find(customer => customer.employee_id === user.emp_id);
      
      setFormData({
        customer_name:  selectedCustomer ? `${selectedCustomer.id}`: "",
        customer:  selectedCustomer ? `${selectedCustomer.firstname} ${selectedCustomer.lastname}`: "",
        customer_location: selectedCustomer ? selectedCustomer.location : "",
        customer_department: selectedCustomer ? selectedCustomer.department : "",
        contact_person: selectedCustomer 
          ? `${selectedCustomer.building}, ${selectedCustomer.block}, ${selectedCustomer.floor}` 
          : "",
        contact_number: selectedCustomer ? selectedCustomer.mobile : "",
        contact_mail: selectedCustomer ? selectedCustomer.email : "",
        nature_of_call: "",
        ticket_type: "",
        ticket_service: "",
        department: "",
        domain: "",
        sub_domain: "",
        sla_priority: "",
        issue_nature: "",
        created_by: user.userId
      });
    }
  }, [customers]);



  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'customer_nae') {
      const selectedCustomer = customers.find(customer => customer.id === value);

      setFormData({
        ...formData,
        [name]: value,
        customer_location: selectedCustomer ? selectedCustomer.location : "",
        customer_department: selectedCustomer ? selectedCustomer.department : "",
        contact_person: selectedCustomer 
        ? `${selectedCustomer.building}, ${selectedCustomer.block}, ${selectedCustomer.floor}` 
        : "",
        contact_number: selectedCustomer ? selectedCustomer.mobile : "",
        contact_mail: selectedCustomer ? selectedCustomer.email : "",
      });
    } 
    
    else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
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
  const filteredSubDomains = subDomains.filter(
    (subDomain) => subDomain.domain_id === formData.domain
  );
  const filteredSubCatagory = ticketnoc.filter(
    (ticketnoc) => ticketnoc.type_id === formData.ticket_type
  ); 
  const filteredIssues = ticketServices.filter(
    (ticketservice) => ticketservice.sub_id === formData.nature_of_call
  );  
  console.log(formData.nature_of_call)
  console.log(filteredIssues)
  const filteredSla = ticketsla.filter(
    (sla) => sla.customer_id === formData.customer_name
  );
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    document.body.classList.add('cursor-wait', 'pointer-events-none');
    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }
    if (attachment) {
      form.append("attachment", attachment);
    }

    try {
     
      const response = await fetch(`${baseURL}/backend/submit.php`, {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }
      setSubmissionStatus({ success: true, message: result.message });
      toast.success("Ticket added");
      document.body.classList.remove('cursor-wait', 'pointer-events-none');
      navigate("/dashboard");
    } catch (error) {
      setSubmissionStatus({
        success: false,
        message:
          "There was a problem with your fetch operation: " + error.message,
      });
    }
  };

  return (
    <div className="bg-box text-xs mx-auto sm:overflow-y-scroll lg::overflow-y-hidden h-auto ticket-scroll ">
      <div className="max-w-full mt-1 ml-1 bg-box p-3 pt-4 h-[95%]">
        
        <form onSubmit={handleSubmit} className="space-y-4 text-label">
          <div className="grid grid-cols-no ml-0 overflow-x-hidden md:grid-cols-2 gap-x-10 md:ml-10 md:pr-10 mb-0 ">
            <div className="font-mont font-semibold text-2xl mb-3">
              Employee Details:
            </div>
            <div className="font-mont font-semibold text-2xl mb-3">
              Ticket Detail:
            </div>
            <div className="flex items-center mb-3 mr-4">
              <label className="text-sm font-semibold text-prime mr-2 w-32">
                Employee <span className="text-red-600 text-md font-bold">*</span>
              </label>
              <input
                type="hidden"
                name="customer_name"
                placeholder="Enter Name"
                value={formData.customer_name}
                onChange={handleChange}
                disabled
                className="flex-grow text-xs bg-box border p-1.5 px-2 rounded outline-none transition ease-in-out delay-150 focus:border focus:border-flo max-w-72"
              />
                <input
                type="text"
                name="customer_name"
                placeholder="Enter Name"
                value={formData.customer}
                onChange={handleChange}
                disabled
                className="flex-grow text-xs bg-box border p-1.5 px-2 rounded outline-none transition ease-in-out delay-150 focus:border focus:border-flo max-w-72"
              />
             
            </div>
            <div className="flex items-center mb-3 mr-4">
              <label className="text-sm font-semibold text-prime mr-2 w-32">
              Catagory <span className="text-red-600 text-md font-bold">*</span>
              </label>
              <select
                name="ticket_type"
                value={formData.ticket_type}
                onChange={handleChange}
                required
                className="flex-grow text-xs bg-box border p-1.5  rounded outline-none focus:border-flo focus:ring-flo max-w-72"
              >
                <option value="" className="custom-option">
                  Select Catagory
                </option>
                {ticketTypes.map((ticket) => (
                  <option
                    key={ticket.id}
                    value={ticket.id}
                    className="custom-option"
                  >
                    {ticket.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center mb-3 mr-4">
              <label className="text-sm font-semibold text-prime mr-2 w-32">
                Location
              </label>
              <input
                type="text"
                name="customer_location"
                placeholder="Enter location"
                value={formData.customer_location}
                onChange={handleChange}
                className="flex-grow text-xs bg-box border p-1.5 px-2 rounded outline-none transition ease-in-out delay-150 focus:border focus:border-flo max-w-72"
              />
             
            </div>
            <div className="flex items-center mb-3 mr-4">
              <label className="text-sm font-semibold text-prime mr-2 w-32">
              Sub Catagory <span className="text-red-600 text-md font-bold">*</span>
              </label>
              <select
                name="nature_of_call"
                value={formData.nature_of_call}
                onChange={handleChange}
                required
                disabled={!formData.ticket_type}
                //disabled={!(formData.ticket_type == 1 || formData.ticket_type == 4)}
                className="flex-grow text-xs bg-box border p-1.5  rounded outline-none focus:border-flo focus:ring-flo max-w-72"
              >
                <option value="" className="custom-option">
                  Select Sub Catagory
                </option>
                {filteredSubCatagory.map((subCatagory) => (
                  <option key={subCatagory.id} value={subCatagory.id} className="custom-option">
                    {subCatagory.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center mb-3 mr-4">
              <label className="text-sm font-semibold text-prime mr-2 w-32">
                Department
              </label>
              <input
                type="text"
                name="customer_department"
                placeholder="Enter department"
                value={formData.customer_department}
                onChange={handleChange}
                className="flex-grow text-xs bg-box border p-1.5  px-2 rounded outline-none transition ease-in-out delay-150 focus:border focus:border-flo max-w-72"
              />
              
            </div>
            <div className="flex items-center mb-3 mr-4">
              <label className="text-sm font-semibold text-prime mr-2 w-32">
                Type of Issue
              </label>
              <select
                name="ticket_service"
                value={formData.ticket_service}
                onChange={handleChange}
                //disabled={!(formData.ticket_type == 1 || formData.ticket_type == 4)}
                className="flex-grow text-xs bg-box border p-1.5  rounded outline-none focus:border-flo focus:ring-flo max-w-72"
              >
                <option value="" className="custom-option">
                  Select Service
                </option>
                {filteredIssues.map((service) => (
                  <option
                    key={service.id}
                    value={service.id}
                    className="custom-option"
                  >
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center mb-3 mr-4">
              <label className="text-sm font-semibold text-prime mr-2 w-32">
                Place
              </label>
              <input
                type="text"
                name="contact_person"
                placeholder="Enter Contact Person"
                value={formData.contact_person}
                onChange={handleChange}
                className="flex-grow text-xs bg-box border p-1.5  px-2 rounded outline-none transition ease-in-out delay-150 focus:border focus:border-flo max-w-72"
              />
            </div>
            <input
                type="hidden"
                name="created_by"
                value={formData.created_by}
                onChange={handleChange}
                 />
            <div className="flex items-center mb-3 mr-4">
        <label className="text-sm font-semibold text-prime mr-2 w-32">
          Division <span className="text-red-600 text-md font-bold"></span>
        </label>
        <select
          name="domain"
          value={formData.domain}
          onChange={handleChange}
          className="flex-grow text-xs bg-box border p-1.5  rounded outline-none focus:border-flo focus:ring-flo max-w-72"
        >
          <option value="" className="custom-option">
            Select Division
          </option>
          {domains.map((domain) => (
            <option key={domain.id} value={domain.id} className="custom-option">
              {domain.name}
            </option>
          ))}
        </select>
      </div>
            <div className="flex items-center mb-3 mr-4">
              <label className="text-sm font-semibold text-prime mr-2 w-32">
                Contact No
              </label>
              <input
                type="tel"
                name="contact_number"
                placeholder="Enter Contact No"
                value={formData.contact_number}
                onChange={handleChange}
                className="flex-grow text-xs bg-box border p-1.5 px-2 rounded outline-none transition ease-in-out delay-150 focus:border focus:border-flo max-w-72"
              />
            </div>
            <div className="flex items-center mb-3 mr-4">
        <label className="text-sm font-semibold text-prime mr-2 w-32">
          Sub Division
        </label>
        <select
          name="sub_domain"
          value={formData.sub_domain}
          onChange={handleChange}
          className="flex-grow text-xs bg-box border p-1.5  rounded outline-none focus:border-flo focus:ring-flo max-w-72"
          disabled={!formData.domain}
        >
          <option value="" className="custom-option">
            Select Sub Division
          </option>
          {filteredSubDomains.map((subDomain) => (
            <option key={subDomain.id} value={subDomain.id} className="custom-option">
              {subDomain.name}
            </option>
          ))}
        </select>
      </div>
            <div className="flex items-center mb-3 mr-4">
              <label className="text-sm font-semibold text-prime mr-2 w-32">
                Email
              </label>
              <input
                type="email"
                name="contact_mail"
                placeholder="Enter Contact Email"
                value={formData.contact_mail}
                onChange={handleChange}
                className="flex-grow text-xs bg-box border p-1.5 px-2 rounded outline-none transition ease-in-out delay-150 focus:border focus:border-flo max-w-72"
              />
            </div>

            <div className="flex items-center mb-3 mr-4">
              <label className="text-sm font-semibold text-prime mr-2 w-32">
              Severity <span className="text-red-600 text-md font-bold">*</span>
              </label>
              <select
                name="sla_priority"
                value={formData.sla_priority}
                onChange={handleChange}
                //disabled={filteredSla.length === 0}
                required={ticketsla.length > 0}
                className="flex-grow text-xs bg-box border p-1.5  rounded outline-none transition ease-in-out delay-150 focus:border focus:border-flo max-w-72"
              >
              <option value="" className="custom-option">
                  Select Severity
                </option>
                {ticketsla.map((sla) => (
                  <option
                    key={sla.id}
                    value={sla.id}
                    className="custom-option"
                  >
                    {sla.name}
                  </option>
                ))}
                 </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 ml-2 pr-2 sm:ml-20 sm:pr-20">
            <div className="-mb-3 mr-4 md:mr-0 md:w-full flex justify-center items-center">
              <div className="w-full md:w-full">
                <label className="block font-semibold text-prime mb-2 font-mont text-lg">
                  Description of Issue
                </label>
                <textarea
                  name="issue_nature"
                  placeholder="Enter Detail..."
                  value={formData.issue_nature}
                  onChange={handleChange}
                  className="w-full text-base h-16 bg-box border p-1.5  rounded outline-none transition ease-in-out delay-150 focus:border focus:border-flo"
                ></textarea>
              </div>
            </div>

            <div className="ml-4 mt-5 mb-1 md:ml-0 md:w-full flex justify-center items-center">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center rounded-lg cursor-pointer  dark:hover:bg-bray-800 w-full md:w-1/2"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg
                    className={attachment ? "w-8 h-8 text-flo dark:text-gray-500" : "w-8 h-8 text-gray-500 dark:text-gray-500"}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentcolor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p  className={attachment ? " text-sm text-flo font-bold" : " text-sm text-prime font-bold"}>
                    {attachment ? attachment.name : "Click to upload"}
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  name="attachment"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-center ">
            <button
              type="submit"
              className="-mt-2 bg-prime font-mont font-semibold text-lg  text-white py-2 px-8 rounded shadow-md focus:outline-none"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;