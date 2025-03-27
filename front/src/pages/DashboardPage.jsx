import { useState, useEffect, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ticketApi, departmentApi, userApi } from "../services/api";
import {
  FiUsers,
  FiClock,
  FiAlertCircle,
  FiActivity,
  FiPieChart,
  FiBarChart2,
  FiDownload,
} from "react-icons/fi";
import LoadingSpinner from "../components/common/LoadingSpinner";
import RecentTickets from "../components/dashboard/RecentTickets";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// Reusable TicketStatusCard component
const TicketStatusCard = ({ title, count, icon: Icon, color, link }) => (
  <div className="bg-white rounded-lg shadow p-5 flex">
    <div
      className={`rounded-full ${color} p-3 mr-4 flex items-center justify-center`}
    >
      <Icon className="text-xl" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
      <div className="flex items-baseline">
        <p className="text-2xl font-bold text-gray-900">{count}</p>
        <Link
          to={link}
          className="ml-3 text-sm text-primary-600 hover:text-primary-800"
        >
          View all
        </Link>
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const [tickets, setTickets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30); // Default to 30 days
  const { user } = useContext(AuthContext);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
    key: "selection",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Add better error handling
        const [ticketsResponse, departmentsResponse, usersResponse] =
          await Promise.all([
            ticketApi.getAll().catch((err) => {
              console.error("Error fetching tickets:", err);
              return { data: [] };
            }),
            departmentApi.getAll().catch((err) => {
              console.error("Error fetching departments:", err);
              return { data: [] };
            }),
            userApi.getAll().catch((err) => {
              console.error("Error fetching users:", err);
              return { data: [] };
            }),
          ]);

        setTickets(ticketsResponse.data || []);
        setDepartments(departmentsResponse.data || []);
        setUsers(usersResponse.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Add caching
      const cacheKey = "dashboard-data";
      const cachedData = sessionStorage.getItem(cacheKey);
      const cacheExpiry = sessionStorage.getItem(`${cacheKey}-expiry`);

      // Use cached data if it exists and is less than 5 minutes old
      if (
        cachedData &&
        cacheExpiry &&
        new Date().getTime() < parseInt(cacheExpiry)
      ) {
        const {
          tickets: cachedTickets,
          departments: cachedDepts,
          users: cachedUsers,
        } = JSON.parse(cachedData);
        setTickets(cachedTickets);
        setDepartments(cachedDepts);
        setUsers(cachedUsers);
        setLoading(false);
        return;
      }

      // Fetch tickets, departments, and users in parallel
      const [ticketsResponse, departmentsResponse, usersResponse] =
        await Promise.all([
          ticketApi.getAll(),
          departmentApi.getAll(),
          userApi.getAll(),
        ]);

      setTickets(ticketsResponse.data || []);
      setDepartments(departmentsResponse.data || []);
      setUsers(usersResponse.data || []);
      setError(null);

      // Cache the result
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          tickets: ticketsResponse.data || [],
          departments: departmentsResponse.data || [],
          users: usersResponse.data || [],
        })
      );
      sessionStorage.setItem(
        `${cacheKey}-expiry`,
        (new Date().getTime() + 5 * 60 * 1000).toString()
      );
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Add this debugging check
    if (tickets.length > 0) {
      console.log("DEBUG: First ticket example:", {
        id: tickets[0].id,
        creation_date: tickets[0].creation_date,
        last_updated: tickets[0].last_updated,
        resolution_date: tickets[0].resolution_date || "N/A",
        has_resolution_date: !!tickets[0].resolution_date,
        has_last_updated: !!tickets[0].last_updated,
      });

      // Count tickets with each field
      const withResolutionDate = tickets.filter(
        (t) => !!t.resolution_date
      ).length;
      const withLastUpdated = tickets.filter((t) => !!t.last_updated).length;
      console.log("DEBUG: Field availability stats:", {
        total_tickets: tickets.length,
        with_resolution_date: withResolutionDate,
        with_last_updated: withLastUpdated,
      });
    }
  }, [tickets]);

  // Calculate ticket stats based on status
  const ticketStats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    escalated: tickets.filter((t) => t.status === "escalated").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    assignedToMe: tickets.filter((t) => t.assigned_to === user.id).length,
  };

  // Filter tickets based on timeRange
  const getFilteredTickets = () => {
    if (!timeRange) return tickets;

    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - timeRange));

    return tickets.filter((ticket) => {
      const ticketDate = new Date(ticket.creation_date);
      return ticketDate >= cutoffDate;
    });
  };

  const filteredTickets = getFilteredTickets();

  // Status distribution colors - ensure visibility
  const statusData = [
    { name: "Open", value: ticketStats.open, color: "#EAB308" }, // Brighter yellow
    { name: "In Progress", value: ticketStats.inProgress, color: "#3B82F6" }, // Brighter blue
    { name: "Escalated", value: ticketStats.escalated, color: "#EF4444" }, // Brighter red
    { name: "Closed", value: ticketStats.closed, color: "#22C55E" }, // Brighter green
  ].filter((item) => item.value > 0);

  // 2. VOLUME TREND DATA
  const volumeTrendData = (() => {
    // Create map of dates with zeros
    const dates = {};
    const now = new Date();
    for (let i = 0; i < Math.min(14, timeRange); i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dates[dateStr] = { date: dateStr, created: 0, closed: 0 };
    }

    // Fill with actual data
    filteredTickets.forEach((ticket) => {
      const createdDate = ticket.creation_date
        ? ticket.creation_date.split("T")[0]
        : null;
      const closedDate =
        ticket.status === "closed" &&
        (ticket.resolution_date || ticket.last_updated)
          ? (ticket.resolution_date || ticket.last_updated).split("T")[0]
          : null;

      if (createdDate && dates[createdDate]) dates[createdDate].created++;
      if (closedDate && dates[closedDate]) dates[closedDate].closed++;
    });

    // Convert to array and sort by date
    return Object.values(dates)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      }));
  })();

  // 3. RESOLUTION TIME DATA
  const resolutionTimeData = (() => {
    // More detailed debugging
    console.log("DEBUG: Starting resolution time calculation");
    console.log("DEBUG: Total tickets:", filteredTickets.length);

    // Make priority keys all lowercase for case-insensitive matching
    const priorityTimes = { low: 0, medium: 0, high: 0, urgent: 0 };
    const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };

    // Get closed tickets with proper date fields
    const closedTickets = filteredTickets.filter((t) => t.status === "closed");
    console.log("DEBUG: Total closed tickets:", closedTickets.length);

    // Check if we have date fields
    console.log(
      "DEBUG: Sample closed ticket:",
      closedTickets.length > 0
        ? {
            id: closedTickets[0].id,
            created: closedTickets[0].creation_date,
            updated: closedTickets[0].updated_at,
            priority: closedTickets[0].priority,
          }
        : "No closed tickets"
    );

    // Process all closed tickets
    closedTickets.forEach((ticket) => {
      // Default to medium if priority is missing
      const rawPriority = ticket.priority || "medium";

      // Log each ticket for debugging
      console.log(
        `DEBUG: Processing ticket #${ticket.id}, status=${ticket.status}, priority=${rawPriority}`
      );

      // Make sure we have dates
      if (
        !ticket.creation_date ||
        (!ticket.last_updated && !ticket.resolution_date)
      ) {
        console.log(`DEBUG: Ticket #${ticket.id} missing dates:`, {
          creation_date: ticket.creation_date,
          resolution_date: ticket.resolution_date,
          last_updated: ticket.last_updated,
        });
        return; // Skip this ticket
      }

      // Parse dates
      const creationDate = new Date(ticket.creation_date);

      // Use resolution_date if available, otherwise last_updated
      const resolutionDate = ticket.resolution_date
        ? new Date(ticket.resolution_date)
        : new Date(ticket.last_updated);

      // Skip invalid dates
      if (
        isNaN(creationDate.getTime()) ||
        isNaN(resolutionDate.getTime()) ||
        resolutionDate <= creationDate
      ) {
        return;
      }

      // Calculate resolution time in hours (minimum 0)
      const diffMs = Math.max(0, resolutionDate - creationDate);
      const hours = Math.round(diffMs / (1000 * 60 * 60));

      // Standardize priority to one of our categories
      const priority = rawPriority.toString().toLowerCase();

      // Map any priority value to one of our standard categories
      let mappedPriority;
      if (priority.includes("low") || priority === "1" || priority === "p1") {
        mappedPriority = "low";
      } else if (
        priority.includes("med") ||
        priority === "2" ||
        priority === "p2"
      ) {
        mappedPriority = "medium";
      } else if (
        priority.includes("high") ||
        priority === "3" ||
        priority === "p3"
      ) {
        mappedPriority = "high";
      } else if (
        priority.includes("urg") ||
        priority === "4" ||
        priority === "p4"
      ) {
        mappedPriority = "urgent";
      } else {
        mappedPriority = "medium"; // Default
      }

      console.log(
        `DEBUG: Ticket #${ticket.id} resolution time: ${hours} hours, priority: ${mappedPriority}`
      );

      // Add to our counts
      priorityTimes[mappedPriority] += hours;
      priorityCounts[mappedPriority]++;
    });

    // Log what we collected
    console.log("DEBUG: Priority counts:", priorityCounts);
    console.log("DEBUG: Priority times:", priorityTimes);

    // Create chart data, including all priorities with data
    const result = Object.keys(priorityTimes)
      .filter((priority) => priorityCounts[priority] > 0)
      .map((priority) => ({
        name: priority.charAt(0).toUpperCase() + priority.slice(1),
        hours:
          Math.round(priorityTimes[priority] / priorityCounts[priority]) || 0,
        count: priorityCounts[priority],
        color:
          priority === "low"
            ? "#22C55E"
            : priority === "medium"
            ? "#3B82F6"
            : priority === "high"
            ? "#F97316"
            : "#EF4444",
      }))
      .sort((a, b) => {
        const order = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
        return order[a.name] - order[b.name];
      });

    console.log("DEBUG: Final resolution time data:", result);

    // If we have no data, provide a meaningful placeholder
    if (result.length === 0) {
      console.log("DEBUG: No resolution time data available");
      return [
        {
          name: "No Data",
          hours: 0,
          count: 0,
          color: "#CBD5E1",
        },
      ];
    }

    return result;
  })();

  // 4. USER PERFORMANCE DATA
  const userPerformanceData = (() => {
    const userStats = {};

    filteredTickets.forEach((ticket) => {
      if (!ticket.assigned_to) return;

      const userId = ticket.assigned_to;
      if (!userStats[userId]) {
        const userData = users.find((u) => u.id === userId);

        // Create full name with proper formatting - handle all possible user data formats
        let fullName = "Unknown User";
        if (userData) {
          // Check for first_name/last_name fields (newer format)
          if (userData.first_name || userData.last_name) {
            fullName = `${userData.first_name || ""} ${
              userData.last_name || ""
            }`.trim();
          }
          // If single name field exists (older format)
          else if (userData.name) {
            fullName = userData.name;
          }
          // Fall back to username if available
          else if (userData.username) {
            fullName = userData.username;
          }
          // Last resort - just show the user ID
          else {
            fullName = `User ${userId}`;
          }
        }

        userStats[userId] = {
          id: userId,
          name: fullName, // Always use the formatted name
          resolved: 0,
          open: 0,
          inProgress: 0,
          escalated: 0,
        };
      }

      if (ticket.status === "closed") {
        userStats[userId].resolved++;
      } else if (ticket.status === "open") {
        userStats[userId].open++;
      } else if (ticket.status === "in_progress") {
        userStats[userId].inProgress++;
      } else if (ticket.status === "escalated") {
        userStats[userId].escalated++;
      }
    });

    // Log the data to ensure names are set correctly
    console.log("User performance data with names:", Object.values(userStats));

    return Object.values(userStats)
      .sort((a, b) => b.resolved - a.resolved)
      .slice(0, 5);
  })();

  // Backlog age chart colors - more distinct
  const backlogColors = ["#22C55E", "#3B82F6", "#FCD34D", "#FB923C", "#EF4444"];

  // 5. BACKLOG AGE DATA
  const backlogAgeData = (() => {
    const now = new Date();
    const ages = {
      "0-1 days": 0,
      "1-7 days": 0,
      "1-2 weeks": 0,
      "2-4 weeks": 0,
      ">4 weeks": 0,
    };

    filteredTickets
      .filter((t) => t.status !== "closed")
      .forEach((ticket) => {
        const creationDate = new Date(ticket.creation_date);
        const ageInDays = Math.floor(
          (now - creationDate) / (1000 * 60 * 60 * 24)
        );

        if (ageInDays < 1) {
          ages["0-1 days"]++;
        } else if (ageInDays < 7) {
          ages["1-7 days"]++;
        } else if (ageInDays < 14) {
          ages["1-2 weeks"]++;
        } else if (ageInDays < 28) {
          ages["2-4 weeks"]++;
        } else {
          ages[">4 weeks"]++;
        }
      });

    return Object.entries(ages)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);
  })();

  const exportChartData = (chartName, data) => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add headers
    const headers = Object.keys(data[0]).join(",");
    csvContent += headers + "\r\n";

    // Add rows
    data.forEach((item) => {
      const row = Object.values(item).join(",");
      csvContent += row + "\r\n";
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${chartName}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);

    // Trigger download
    link.click();
    document.body.removeChild(link);
  };

  // Function to get user name by ID
  const getUserNameById = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : "Unknown User";
  };

  // Function to get department name by ID
  const getDepartmentNameById = (deptId) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.name : "Unknown Department";
  };

  if (loading) {
    return <LoadingSpinner fullHeight text="Loading dashboard..." />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user.name?.split(" ")[0] || "User"}!
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-6 rounded-lg mb-6 flex items-center">
          <FiAlertCircle className="mr-3 flex-shrink-0 h-5 w-5" />
          <div>
            <p className="font-medium">{error}</p>
            <p className="mt-1 text-sm">
              Check that your backend server is running at{" "}
              {import.meta.env.VITE_API_URL || "http://localhost:5000"} and that
              there are no errors in the console.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Ticket Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <TicketStatusCard
          title="Open Tickets"
          count={ticketStats.open}
          icon={FiAlertCircle}
          color="bg-yellow-100 text-yellow-800"
          link="/tickets?status=open"
        />
        <TicketStatusCard
          title="In Progress"
          count={ticketStats.inProgress}
          icon={FiClock}
          color="bg-blue-100 text-blue-800"
          link="/tickets?status=in_progress"
        />
        <TicketStatusCard
          title="Escalated"
          count={ticketStats.escalated}
          icon={FiActivity}
          color="bg-red-100 text-red-800"
          link="/tickets?status=escalated"
        />
        <TicketStatusCard
          title="Assigned to Me"
          count={ticketStats.assignedToMe}
          icon={FiUsers}
          color="bg-primary-100 text-primary-800"
          link="/tickets?assigned_to_me=true"
        />
      </div>

      {/* Main Analytics Sections */}
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Analytics Overview</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="timeRange" className="text-sm text-gray-600">
            Time period:
          </label>
          <select
            id="timeRange"
            className="border border-gray-300 rounded-md text-sm"
            value={timeRange}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "custom") {
                setShowDatePicker(true);
              } else {
                setTimeRange(Number(value));
                setShowDatePicker(false);
              }
            }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>

          {/* Custom date range picker */}
          {showDatePicker && (
            <div className="absolute right-0 mt-64 z-10 bg-white shadow-lg rounded-md overflow-hidden">
              <DateRangePicker
                ranges={[dateRange]}
                onChange={(item) => {
                  setDateRange(item.selection);

                  // Calculate days difference for filtering
                  const diffTime = Math.abs(
                    item.selection.endDate - item.selection.startDate
                  );
                  const diffDays =
                    Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                  setTimeRange(diffDays);
                }}
                maxDate={new Date()}
              />
              <div className="flex justify-end p-2 border-t">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setShowDatePicker(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* First Row - Most Important Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Side - Ticket Volume Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Ticket Volume Trend</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  exportChartData("ticket-volume", volumeTrendData)
                }
                className="text-sm text-gray-500 hover:text-primary-600"
                title="Export as CSV"
              >
                <FiDownload />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={volumeTrendData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="created"
                name="New Tickets"
                stroke="#3B82F6"
                fill="#93C5FD"
              />
              <Area
                type="monotone"
                dataKey="closed"
                name="Resolved Tickets"
                stroke="#22C55E"
                fill="#86EFAC"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right Side - Status Distribution and Backlog Age */}
        <div className="grid grid-rows-2 gap-6">
          {/* Status Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Status Distribution</h3>
              <FiPieChart className="text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  labelFormatter={() => "Tickets"}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Backlog Age */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Ticket Backlog Age</h3>
              <FiClock className="text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart
                data={backlogAgeData}
                layout="vertical"
                margin={{ top: 5, right: 5, left: 40, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#9333EA">
                  {backlogAgeData.map((entry, index) => {
                    // Color gets redder with older tickets
                    const colors = [
                      "#22C55E",
                      "#93C5FD",
                      "#FCD34D",
                      "#FB923C",
                      "#EF4444",
                    ];
                    return <Cell key={`cell-${index}`} fill={colors[index]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Resolution Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              Average Resolution Time by Priority
            </h3>
            <div className="text-xs text-gray-500">in hours</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {resolutionTimeData[0]?.name === "No Data" ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
                <p className="text-lg mb-2">No resolution data available</p>
                <p className="text-sm">
                  Close some tickets to see average resolution times
                </p>
              </div>
            ) : (
              <BarChart
                data={resolutionTimeData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis
                  label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} hours (${props.payload.count} tickets)`,
                    "Resolution Time",
                  ]}
                />
                <Bar dataKey="hours" name="Average Hours to Resolution">
                  {resolutionTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* User Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Agent Performance</h3>
            <div className="text-xs text-gray-500">top 5 users</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={userPerformanceData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
              />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fontSize: 12 }} // Ensure text is sized appropriately
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="resolved"
                name="Resolved"
                fill="#22C55E"
                stackId="a"
              />
              <Bar
                dataKey="inProgress"
                name="In Progress"
                fill="#3B82F6"
                stackId="a"
              />
              <Bar
                dataKey="escalated"
                name="Escalated"
                fill="#EF4444"
                stackId="a"
              />
              <Bar dataKey="open" name="Open" fill="#EAB308" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">Recent Activity</h2>
        </div>
        <div className="p-4">
          <RecentTickets
            tickets={tickets
              .sort(
                (a, b) =>
                  new Date(b.updated_at || b.creation_date) -
                  new Date(a.updated_at || a.creation_date)
              )
              .slice(0, 5)}
          />
        </div>
        <div className="p-4 border-t text-center">
          <Link
            to="/tickets"
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            View all tickets
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
