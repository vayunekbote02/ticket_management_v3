import axios from "axios";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateUserTicket = () => {
  // necessary initializations
  const { user_id } = useParams();
  const navigate = useNavigate();

  // states for all the input fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [issue, setIssue] = useState("");
  const [showIssueInput, setShowIssueInput] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [phone, setPhone] = useState("");
  const [landline, setLandline] = useState("");
  const [classification, setClassification] = useState("");
  const [showClassificationInput, setShowClassificationInput] = useState(false);
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState(null);
  // main submit function
  const handleSubmit = async (event) => {
    event.preventDefault();
    const currentDate = new Date();
    const newComplaint = {
      //user_id: user_id, //user_id is coming from the URL itself and then it is passed to the backend
      name: name,
      email: email,
      phoneNumber: phone,
      landlineNumber: landline || "",
      issue: issue || "",
      classification: classification || "",
      channel: channel || "",
      remarks: remarks || "",
      createdAt: currentDate.toISOString(),
      resolved: false,
      priority: "low",
      assignedEngineer: "",
    };
    // console.log(newComplaint);

    try {
      const response = await axios.post(
        `/api/user/${user_id}/createticket`,
        newComplaint,
        {
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${cookies.token}`,
          },
        }
      );
      const data = await response.data;
      // console.log(data);
      if (data.status === 200) {
        setStatus("success");
        toast.success("Your ticket has been successfully created.");
        navigate(`/user/${user_id}/tickets`);
        // Handle the created ticket
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus(error);
    }
    // setUsersComplaints([...usersComplaints, newComplaint]);
    // Reset the form after submission
    setName("");
    setEmail("");
    setPhone("");
    setLandline("");
    setIssue("");
    setClassification("");
    setChannel("");
    setRemarks("");
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center min-h-screen">
        {status === "error" ? (
          <div variant="h4" className="text-red-500">
            You are not authorized to access this page.
          </div>
        ) : (
          <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold text-center mb-6">
              Create Ticket
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="username"
                />
                <input
                  required
                  type="email"
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <input
                  required
                  type="tel"
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  type="tel"
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Landline Number"
                  value={landline}
                  onChange={(e) => setLandline(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center">
                <label className="w-full sm:w-1/3">Issue:</label>
                <select
                  className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={issue}
                  onChange={(e) => {
                    setIssue(e.target.value);
                    setShowIssueInput(e.target.value === "Others");
                  }}
                >
                  <option value="" disabled>
                    Your Issue
                  </option>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Networking">Networking</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              {showIssueInput && (
                <div className="flex flex-col sm:flex-row items-center">
                  <label className="w-full sm:w-1/3 text-emerald-600">
                    Type your issue:
                  </label>
                  <input
                    className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={issue}
                    onChange={(e) => {
                      setIssue(e.target.value);
                    }}
                  />
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center">
                <label className="w-full sm:w-1/3 ">Classification:</label>
                <select
                  className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={classification}
                  onChange={(e) => {
                    setClassification(e.target.value);
                    setShowClassificationInput(e.target.value === "Others");
                  }}
                >
                  <option value="" disabled>
                    Select a classification
                  </option>
                  <option value="Question">Question</option>
                  <option value="Problem">Problem</option>
                  <option value="Feature">Feature</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              {showClassificationInput && (
                <div className="flex flex-col sm:flex-row items-center">
                  <label className="w-full sm:w-1/3 text-emerald-600">
                    Type other classification:
                  </label>
                  <input
                    className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={classification}
                    onChange={(e) => {
                      setClassification(e.target.value);
                    }}
                  />
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center">
                <label className="w-full sm:w-1/3">Channel:</label>
                <select
                  className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option value="" disabled>
                    How did you contact?
                  </option>
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                  <option value="Web">Web</option>
                  <option value="Chat">Chat</option>
                  <option value="Forums">Forums</option>
                  <option value="Feedback Widget">Feedback Widget</option>
                </select>
              </div>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              ></textarea>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-8 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-40"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateUserTicket;
