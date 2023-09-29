import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Autocomplete from "../../components/Autocomplete";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextModal from "../../components/TextModal";

const ViewTicketDetails = () => {
  const { user_id } = useParams();
  const { ticket_id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState({}); //the ticket whose info is printed
  const [status, setStatus] = useState(ticket.resolved);
  const [showModal, setShowModal] = React.useState(false); //to hide or show assign engineer modal
  const [engineerId, setEngineerId] = useState(""); //id passed to backend
  const [engineerName, setEngineerName] = useState(""); //used for frontend
  const [engineerInfo, setEngineerInfo] = useState([]); //passed to autocomplete
  const [nameForAE, setNameForAE] = useState(""); //to show name of assigned engineer on page load
  const [selectedPriority, setSelectedPriority] = useState("set priority"); //to set the priority of the ticket in the backend
  const [showLogs, setShowLogs] = useState(false);
  const [textMessage, setTextMessage] = useState("");

  const userRole = localStorage.getItem("role");
  const getRole = () => {
    if (userRole === "9087-t1-vaek-123-riop") {
      return "admin";
    } else if (userRole === "2069-t2-prlo-456-fiok") {
      return "engineer";
    } else if (userRole === "4032-t3-raek-789-chop") {
      return "user";
    }
  };

  //initial useEffect to fetch all the tickets
  useEffect(() => {
    let isMounted = true;

    const fetchTicketDetails = async () => {
      try {
        const res = await axios.get(`/api/user/${user_id}/ticket/${ticket_id}`);
        const ticket = await res.data.ticket;

        if (isMounted) {
          //remove this unnecessary line of code
          setTicket(ticket);
          setStatus(ticket.resolved);
        }
      } catch (error) {
        // Handle error
        console.log(error);
      }
    };

    fetchTicketDetails();

    return () => {
      isMounted = false;
    };
  }, [user_id, ticket_id]);

  //for loading the engineer name on page load, so that it can be used to show engineer name in assignedEngineer field.
  useMemo(() => {
    const fetchEngineers = async () => {
      try {
        const res = await axios.get(
          `/api/admin/${user_id}/engineers`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${cookies.token}`,
            },
          }
        );
        const data = await res.data;
        if (data.status === 200) {
          const engineerList = data.engineers;
          const engineerInfoScope = engineerList.map((engineer) => [
            engineer.name,
            engineer.userId,
          ]);
          setEngineerInfo(engineerInfoScope);
          const assignedEngineerToSet = engineerInfo.find(
            (engineer) => engineer[1] === ticket.assignedEngineer
          );

          const assignedEngineerName = assignedEngineerToSet
            ? assignedEngineerToSet[0]
            : null;
          // console.log("engineers fetched");
          setNameForAE(assignedEngineerName);
          // console.log("fetchEngineersFirst was run!");
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchEngineers();
  }, [ticket]);

  useEffect(() => {
    const updateResolvedStatus = async () => {
      try {
        await axios.put(
          `/api/user/${user_id}/ticket/${ticket_id}/update`,
          {
            resolved: status,
          },
          {
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${cookies.token}`,
            },
          }
        );
        // console.log("update status run!");
      } catch (error) {
        console.error(error);
      }
    };

    updateResolvedStatus();
  }, [status, user_id, ticket_id]);

  const handleAssignEngineer = async () => {
    setShowModal(true);
    try {
      const res = await axios.get(
        `/api/admin/${user_id}/engineers`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${cookies.token}`,
          },
        }
      );
      const data = await res.data;
      if (data.status === 200) {
        const engineerList = data.engineers;
        const engineerInfoScope = engineerList.map((engineer) => [
          engineer.name,
          engineer.userId,
        ]);
        setEngineerInfo(engineerInfoScope);
        // console.log(JSON.parse(localStorage.getItem("engineers")));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleInputChange = (value) => {
    setEngineerId(value[1]);
    setEngineerName(value[0]);
  };

  const setEngineer = async () => {
    setShowModal(false);
    try {
      const res = await axios.put(
        `/api/admin/${user_id}/ticket/${ticket_id}/set_engineer`,
        {
          engineerId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${cookies.token}`,
          },
        }
      );
      const data = await res.data;
      if (data.status === 200) {
        toast.success(
          `The ticket has been assigned to ${engineerName}. Refresh page to see changes.`
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const acceptTicket = async () => {
    try {
      const res = await axios.put(
        `/api/admin/${user_id}/ticket/${ticket_id}/accept_ticket`
      );
      const data = await res.data;
      if (data.status === 200) {
        toast.success(
          `The ticket has been accepted. Refresh page to see changes.`
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const priorityFunc = async (e) => {
    setSelectedPriority(e.target.value);
    try {
      const res = await axios.put(
        `/api/admin/${user_id}/ticket/${ticket_id}/set_priority`,
        {
          priority: e.target.value,
        },
        {
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${cookies.token}`,
          },
        }
      );
      const data = await res.data;
      if (data.status === 200) {
        toast.success(
          `The priority has been set to ${e.target.value}. Refresh page to see changes.`
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const sendTextMessage = async () => {
    setShowLogs(false);
    if (textMessage !== "") {
      try {
        const res = await axios.put(
          `/api/${getRole()}/${user_id}/ticket/${ticket_id}/add_message`,
          {
            userRole,
            textMessage,
          },
          {
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${cookies.token}`,
            },
          }
        );
        const data = await res.data;
        if (data.status === 200) {
          toast.success("Your comment has been added. Refresh to see changes.");
        }
      } catch (err) {
        toast.error(err);
      }
    }
  };

  const deleteFunc = async () => {
    try {
      const res = await axios.delete(
        `/api/admin/${user_id}/ticket/${ticket_id}/delete_ticket`
      );
      const data = await res.data;
      if (data.status === 200) {
        navigate(`/user/${user_id}/tickets`);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 to-green-200">
        <div className="max-w-md w-full mx-4 my-8 bg-slate-100 shadow-lg rounded-lg border-dotted border-2 border-blue-500">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">
              Ticket Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="font-bold text-blue-800">Created By: </span>
                <span className="ml-2 text-gray-700">{ticket.name}</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-blue-800">Issue: </span>
                <span className="ml-2 text-gray-700">{ticket.issue}</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-blue-800">
                  Classification:{" "}
                </span>
                <span className="ml-2 text-gray-700">
                  {ticket.classification}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-blue-800">Channel: </span>
                <span className="ml-2 text-gray-700">{ticket.channel}</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-blue-800">Created At: </span>
                <span className="ml-2 text-gray-700">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-blue-800">Ticket Status: </span>
                <span
                  className={`ml-2 text-gray-700 ${
                    status ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {status ? "Resolved" : "Unresolved"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-blue-800">Priority: </span>
                <span className="ml-2 text-gray-700">{ticket.priority}</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-blue-800">Accepted?: </span>
                <span className="ml-2 text-gray-700">
                  {ticket.accepted === 1 ? "Yes" : "No"}
                </span>
              </div>
              {userRole !== "2069-t2-prlo-456-fiok" && (
                <div className="flex items-center">
                  <span className="font-bold text-blue-800">Assigned To: </span>
                  <span className="ml-2 text-gray-700">
                    {ticket.assignedEngineer ? nameForAE : "Not Assigned"}
                  </span>
                </div>
              )}
              <div className="flex items-center">
                <span className="font-bold text-blue-800">User Remarks: </span>
                <span className="ml-2 text-gray-700">{ticket.remarks}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-center py-4 border-t border-gray-300">
            <button
              className="px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              onClick={() => setStatus(!status)}
            >
              {status ? "Mark Unresolved" : "Mark Resolved"}
            </button>
            {userRole === "9087-t1-vaek-123-riop" && (
              <button
                onClick={handleAssignEngineer}
                className="px-6 py-2 text-white bg-teal-500 rounded hover:bg-teal-600"
              >
                Assign Engineer
              </button>
            )}
          </div>
          {userRole === "9087-t1-vaek-123-riop" && (
            <div className="flex justify-center gap-3 pb-4">
              {ticket.accepted === 0 && (
                <button
                  onClick={acceptTicket}
                  className="py-2 px-6 text-white bg-gray-500 rounded hover:bg-gray-600"
                >
                  Accept Ticket
                </button>
              )}
              <select
                className="px-4 py-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-12 md:col-span-2"
                value={selectedPriority}
                onChange={priorityFunc}
              >
                <option value="set priority" disabled>
                  Set Priority
                </option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}
          <div className="flex justify-center mb-4 gap-2">
            <button
              onClick={() => setShowLogs(true)}
              className="py-2 px-6 text-white bg-teal-500 rounded hover:bg-emerald-600"
            >
              Show Logs
            </button>
            <button
              onClick={deleteFunc}
              className="py-2 px-6 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Delete Ticket
            </button>
          </div>
        </div>
      </div>
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none min-h-[50vh] max-h-[50vh]">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <h3 className="text-3xl font-semibold">Type Engineer Name</h3>
                </div>
                {/*body*/}
                <div className="relative p-4 flex-auto overflow-y-auto">
                  <Autocomplete
                    suggestions={engineerInfo}
                    setEngineerId={handleInputChange}
                  />
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={setEngineer}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
      {showLogs ? (
        <>
          <TextModal
            ticket={ticket}
            onClose={() => setShowLogs(false)}
            onAddMessage={sendTextMessage}
            textMessage={textMessage}
            setTextMessage={setTextMessage}
          />
        </>
      ) : null}
    </>
  );
};

export default ViewTicketDetails;
