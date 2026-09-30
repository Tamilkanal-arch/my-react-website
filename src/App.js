import React, { useEffect, useState } from "react";
import "./App.css";

const LEAVE_TYPES = ["Paid", "Medical", "Unpaid", "Other"];

const defaultEmployees = [
  {
    id: "EMP001",
    name: "Daniel",
    designation: "Engineer",
    joiningDate: "2026-01-15",
    entitlement: 30,
    civilId: "29200001",
    password: "1234"
  },
  {
    id: "EMP002",
    name: "John",
    designation: "Supervisor",
    joiningDate: "2026-04-10",
    entitlement: 30,
    civilId: "29200002",
    password: "1234"
  }
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function App() {
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem("leaveEmployees");
    return saved ? JSON.parse(saved) : defaultEmployees;
  });

  const [leaves, setLeaves] = useState(() => {
    const saved = localStorage.getItem("leaveRecords");
    return saved ? JSON.parse(saved) : [];
  });

  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem("leaveSession");
    return saved ? JSON.parse(saved) : null;
  });

  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    localStorage.setItem("leaveEmployees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("leaveRecords", JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    if (session) {
      localStorage.setItem("leaveSession", JSON.stringify(session));
    } else {
      localStorage.removeItem("leaveSession");
    }
  }, [session]);

  const logout = () => {
    setSession(null);
    setPage("dashboard");
  };

  if (!session) {
    return <LoginScreen employees={employees} setSession={setSession} />;
  }

  if (session.role === "employee") {
    const employee = employees.find((person) => person.id === session.employeeId);
    return (
      <EmployeePortal
        employee={employee}
        leaves={leaves}
        setLeaves={setLeaves}
        logout={logout}
      />
    );
  }

  return (
    <AdminPortal
      employees={employees}
      setEmployees={setEmployees}
      leaves={leaves}
      setLeaves={setLeaves}
      page={page}
      setPage={setPage}
      logout={logout}
    />
  );
}

function LoginScreen({ employees, setSession }) {
  const [loginType, setLoginType] = useState("admin");
  const [employeeIdType, setEmployeeIdType] = useState("civilId");
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const login = (e) => {
    e.preventDefault();

    if (loginType === "admin") {
      const savedAdmin = JSON.parse(localStorage.getItem("leaveAdmin") || "null");
      const valid =
        (savedAdmin &&
          savedAdmin.email === loginValue &&
          savedAdmin.password === password) ||
        (!savedAdmin && loginValue === "admin@company.com" && password === "admin123");

      if (!valid) {
        alert("Invalid admin email or password.");
        return;
      }

      setSession({ role: "admin", email: loginValue });
      return;
    }

    const employee = employees.find(
      (person) =>
        String(getEmployeeIdentityValue(person, employeeIdType) || "").toLowerCase() ===
          loginValue.trim().toLowerCase() &&
        person.password === password
    );

    if (!employee) {
      alert("Invalid employee civil ID or password.");
      return;
    }

    setSession({ role: "employee", employeeId: employee.id });
  };

  const registerAdmin = (e) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !adminPassword) {
      alert("Please fill all admin fields");
      return;
    }

    localStorage.setItem(
      "leaveAdmin",
      JSON.stringify({ name: adminName, email: adminEmail, password: adminPassword })
    );

    alert("Admin registered successfully.");
    setRegisterMode(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-logo">LM</div>
          <div>
            <h1>Leave Manager</h1>
            <p>Employee Leave Management System</p>
          </div>
        </div>

        {!registerMode ? (
          <>
            <div className="login-switch">
              <button
                type="button"
                className={loginType === "admin" ? "active" : ""}
                onClick={() => setLoginType("admin")}
              >
                Admin Login
              </button>
              <button
                type="button"
                className={loginType === "employee" ? "active" : ""}
                onClick={() => setLoginType("employee")}
              >
                Employee Login
              </button>
            </div>

            <form onSubmit={login}>
              {loginType === "employee" && (
                <>
                  <label>Identification type</label>
                  <select value={employeeIdType} onChange={(e) => setEmployeeIdType(e.target.value)}>
                    <option value="civilId">Civil ID</option>
                    <option value="passport">Passport</option>
                  </select>
                </>
              )}
              <label>{loginType === "admin" ? "Email" : employeeIdType === "passport" ? "Passport number" : "Civil ID"}</label>
              <input
                type={loginType === "admin" ? "email" : "text"}
                value={loginValue}
                placeholder={loginType === "admin" ? "admin@company.com" : `enter ${employeeIdType === "passport" ? "passport number" : "civil id"}`}
                onChange={(e) => setLoginValue(e.target.value)}
                required
              />

              <label>Password</label>
              <input
                type="password"
                value={password}
                placeholder="enter password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit" className="primary-btn">
                Login
              </button>
            </form>

            {loginType === "admin" && (
              <button type="button" className="text-button" onClick={() => setRegisterMode(true)}>
                Register new admin
              </button>
            )}

            <div className="demo-login">
              <strong>Default Admin Login</strong>
              <span>admin@company.com</span>
              <span>admin123</span>
            </div>
          </>
        ) : (
          <>
            <h2>Create Admin Account</h2>
            <form onSubmit={registerAdmin}>
              <label>Admin Name</label>
              <input value={adminName} onChange={(e) => setAdminName(e.target.value)} required />

              <label>Email</label>
              <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />

              <label>Password</label>
              <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />

              <button type="submit" className="primary-btn">
                Register Admin
              </button>
            </form>

            <button type="button" className="text-button" onClick={() => setRegisterMode(false)}>
              ← Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function AdminPortal({ employees, setEmployees, leaves, setLeaves, page, setPage, logout }) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || "");
  const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId) || employees[0] || null;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo small">LM</div>
          <div>
            <strong>Leave Manager</strong>
            <small>ADMIN PANEL</small>
          </div>
        </div>

        <nav>
          {[
            ["dashboard", "▦", "Dashboard"],
            ["employees", "♙", "Employees & Names"],
            ["calendar", "▣", "Leave Calendar"],
            ["requests", "✓", "Leave Requests"]
          ].map(([key, icon, label]) => (
            <button
              key={key}
              type="button"
              className={page === key ? "nav-item active" : "nav-item"}
              onClick={() => setPage(key)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="logged-user">
            <div className="avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <small>Admin</small>
            </div>
          </div>
          <button type="button" className="logout-btn" onClick={logout}>
            ⇥ Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>
              {page === "dashboard" && "Dashboard"}
              {page === "employees" && "Employees & Names"}
              {page === "calendar" && "Leave Calendar"}
              {page === "requests" && "Leave Requests"}
            </h2>
            <p>Manage employee attendance and leave records</p>
          </div>
          <div className="topbar-date">
            {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </header>

        {page === "dashboard" && (
          <Dashboard
            employees={employees}
            leaves={leaves}
            selectedEmployeeId={selectedEmployeeId}
            setSelectedEmployeeId={setSelectedEmployeeId}
          />
        )}

        {page === "employees" && (
          <EmployeesPage
            employees={employees}
            setEmployees={setEmployees}
            setSelectedEmployeeId={setSelectedEmployeeId}
            setPage={setPage}
          />
        )}

        {page === "calendar" && (
          <CalendarPage
            employees={employees}
            selectedEmployee={selectedEmployee}
            selectedEmployeeId={selectedEmployeeId}
            setSelectedEmployeeId={setSelectedEmployeeId}
            leaves={leaves}
            setLeaves={setLeaves}
          />
        )}

        {page === "requests" && (
          <RequestsPage employees={employees} leaves={leaves} setLeaves={setLeaves} />
        )}
      </main>
    </div>
  );
}

function Dashboard({ employees, leaves, selectedEmployeeId, setSelectedEmployeeId }) {
  const [search, setSearch] = useState("");
  const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId) || employees[0] || null;

  const filtered = employees.filter((employee) =>
    `${employee.name} ${employee.id} ${employee.designation}`.toLowerCase().includes(search.toLowerCase())
  );

  const summary = selectedEmployee ? getEmployeeSummary(selectedEmployee, leaves) : null;

  return (
    <>
      {summary && (
        <section className="dashboard-summary">
          <div className="summary-header">
            <div className="summary-person">
              <div className="large-avatar">{selectedEmployee.name.charAt(0).toUpperCase()}</div>
              <div>
                <h3>{selectedEmployee.name}</h3>
                <p>{selectedEmployee.designation}</p>
              </div>
            </div>
            <div className="summary-meta">
              <span>Employee ID</span>
              <strong>{selectedEmployee.id}</strong>
            </div>
            <div className="summary-meta">
              <span>Accrued</span>
              <strong>{summary.accrued} days</strong>
            </div>
            <div className="summary-meta">
              <span>Balance</span>
              <strong>{summary.balance} days</strong>
            </div>
          </div>

          <div className="summary-grid">
            {LEAVE_TYPES.map((type) => (
              <div key={type} className={`summary-metric leave-metric ${type.toLowerCase()}`}>
                <span>{type} Leave</span>
                <strong>{summary[type.toLowerCase()]} days</strong>
              </div>
            ))}
            <div className="summary-metric summary-wide accrued-visual">
              <span>Accrued Leave till Today</span>
              <strong>{summary.accrued} days</strong>
              <small>Based on {selectedEmployee.entitlement} days/year entitlement</small>
            </div>
            <div className="summary-metric summary-wide balance-visual">
              <div>
                <span>Balance vs Taken</span>
                <strong>{summary.balance} days balance</strong>
                <small>{summary.taken} days taken from {summary.accrued} accrued</small>
              </div>
              <div
                className="balance-donut"
                role="img"
                aria-label={`${summary.balance} days balance and ${summary.taken} days taken from ${summary.accrued} accrued`}
                style={{ "--balance-ratio": `${summary.accrued ? (summary.balance / summary.accrued) * 100 : 100}%` }}
              >
                <div className="balance-donut-center">
                  <strong>{summary.balance}</strong>
                  <span>days left</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="content-card">
        <div className="section-header">
          <div>
            <h3>People</h3>
            <p>Search employees to review leave summary.</p>
          </div>
          <ExportControls employees={employees} leaves={leaves} />
        </div>

        <div className="search-box">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee by name, ID or designation..."
          />
        </div>

        <div className="employee-list">
          {filtered.map((employee) => (
            <div
              key={employee.id}
              className={selectedEmployeeId === employee.id ? "employee-row selected" : "employee-row"}
              onClick={() => setSelectedEmployeeId(employee.id)}
            >
              <div className="employee-avatar">{employee.name.charAt(0).toUpperCase()}</div>
              <div className="employee-main">
                <strong>{employee.name}</strong>
                <span>
                  {employee.id} • {employee.designation}
                </span>
              </div>
              <div className="employee-date">
                Joining Date
                <strong>{formatDate(employee.joiningDate)}</strong>
              </div>
              <div className="employee-entitlement">
                Entitlement
                <strong>{employee.entitlement} days/year</strong>
              </div>
              <div className="arrow">›</div>
            </div>
          ))}

          {filtered.length === 0 && <div className="empty-state">No employees found.</div>}
        </div>
      </section>
    </>
  );
}

function ExportControls({ employees, leaves }) {
  const currentYear = new Date().getFullYear();
  const [employeeId, setEmployeeId] = useState("all");
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const leaveYears = leaves.map((leave) => Number(leave.date.slice(0, 4))).filter(Number.isFinite);
  const firstYear = Math.min(currentYear - 5, ...leaveYears);
  const lastYear = Math.max(currentYear + 5, ...leaveYears);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index);

  return (
    <div className="export-controls">
      <label>
        Employee
        <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
          <option value="all">All employees</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>{employee.name} ({employee.id})</option>
          ))}
        </select>
      </label>
      <label>
        Year
        <select value={year} onChange={(event) => setYear(event.target.value)}>
          <option value="all">All years</option>
          {years.map((yearOption) => <option key={yearOption} value={yearOption}>{yearOption}</option>)}
        </select>
      </label>
      <label>
        Month
        <select value={month} onChange={(event) => setMonth(event.target.value)}>
          <option value="all">All months</option>
          {monthNames.map((monthName, index) => <option key={monthName} value={index + 1}>{monthName}</option>)}
        </select>
      </label>
      <button
        type="button"
        className="export-button"
        onClick={() => downloadLeaveData(employees, leaves, { employeeId, year, month })}
      >
        Export to Excel
      </button>
    </div>
  );
}

function EmployeesPage({ employees, setEmployees, setSelectedEmployeeId, setPage }) {
  const emptyForm = {
    id: "",
    name: "",
    designation: "",
    joiningDate: "",
    entitlement: 30,
    identityType: "civilId",
    identityNumber: "",
    password: "1234"
  };

  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  const addEmployee = (e) => {
    e.preventDefault();

    if (!form.id || !form.name || !form.joiningDate || form.entitlement === "") {
      alert("Please fill in all required employee details.");
      return;
    }

    if (employees.some((employee) => employee.id.toLowerCase() === form.id.toLowerCase())) {
      alert("Employee ID already exists.");
      return;
    }

    const newEmployee = {
      ...form,
      identityNumber: form.identityNumber.trim(),
      civilId: form.identityType === "civilId" ? form.identityNumber.trim() : "",
      passport: form.identityType === "passport" ? form.identityNumber.trim() : "",
      password: form.password || "1234"
    };

    setEmployees((prev) => [...prev, newEmployee]);
    setSelectedEmployeeId(form.id);
    setForm(emptyForm);
    setPage("calendar");
    alert("Employee added successfully.");
  };

  const deleteEmployee = (id) => {
    if (!window.confirm("Delete this employee?")) return;
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
  };

  const filtered = employees.filter((employee) =>
    `${employee.name} ${employee.id} ${employee.designation}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="two-column">
      <section className="content-card">
        <div className="section-header">
          <div>
            <h3>Add New Employee</h3>
            <p>Create an employee profile.</p>
          </div>
        </div>

        <form className="employee-form" onSubmit={addEmployee}>
          <div className="form-grid">
            <div>
              <label htmlFor="employee-id">
                Employee ID <span className="required">*</span>
              </label>
              <input id="employee-id" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} required />
            </div>

            <div>
              <label htmlFor="employee-name">
                Employee Name <span className="required">*</span>
              </label>
              <input id="employee-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div>
              <label htmlFor="employee-designation">Designation</label>
              <input id="employee-designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
            </div>

            <div>
              <label htmlFor="employee-joining-date">
                Joining Date <span className="required">*</span>
              </label>
              <input id="employee-joining-date" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} required />
            </div>

            <div>
              <label htmlFor="employee-entitlement">
                Leave Entitlement / Year <span className="required">*</span>
              </label>
              <input id="employee-entitlement" type="number" min="0" value={form.entitlement} onChange={(e) => setForm({ ...form, entitlement: e.target.value === "" ? "" : Number(e.target.value) })} required />
            </div>

            <div>
              <label htmlFor="employee-identity-type">Identification type</label>
              <select id="employee-identity-type" value={form.identityType} onChange={(e) => setForm({ ...form, identityType: e.target.value, identityNumber: "" })}>
                <option value="civilId">Civil ID</option>
                <option value="passport">Passport</option>
              </select>
            </div>

            <div>
              <label htmlFor="employee-identity-number">{form.identityType === "passport" ? "Passport number" : "Civil ID"}</label>
              <input id="employee-identity-number" value={form.identityNumber} onChange={(e) => setForm({ ...form, identityNumber: e.target.value })} />
            </div>
          </div>

          <button type="submit" className="primary-btn">
            + Add Employee
          </button>
        </form>
      </section>

      <section className="content-card employee-directory">
        <div className="section-header">
          <div>
            <h3>Employee Directory</h3>
            <p>{employees.length} employees</p>
          </div>
        </div>

        <div className="search-box">
          <span>⌕</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." />
        </div>

        {filtered.map((employee) => (
          <div className="directory-row" key={employee.id}>
            <div className="employee-avatar">{employee.name.charAt(0).toUpperCase()}</div>
            <div>
              <strong>{employee.name}</strong>
              <small>
                {employee.id} • {employee.designation || "Employee"}
              </small>
            </div>
            <button
              type="button"
              className="calendar-link"
              onClick={() => {
                setSelectedEmployeeId(employee.id);
                setPage("calendar");
              }}
            >
              Calendar
            </button>
            <button type="button" className="delete-btn" onClick={() => deleteEmployee(employee.id)}>
              Delete
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

function CalendarPage({ employees, selectedEmployee, selectedEmployeeId, setSelectedEmployeeId, leaves, setLeaves }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [leaveType, setLeaveType] = useState("Paid");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (!selectedEmployee) {
    return <div className="content-card empty-state">No employee selected.</div>;
  }

  const monthCells = getMonthCells(year, month);
  const selectedDates = getRangeDates(startDate, endDate);
  const employeeLeaves = leaves.filter((leave) => leave.employeeId === selectedEmployee.id && leave.source === "admin");

  const handleCellClick = (date) => {
    const value = formatISO(date);
    if (value < selectedEmployee.joiningDate) {
      alert("Leave cannot be entered before joining date.");
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(value);
      setEndDate("");
      return;
    }

    if (value < startDate) {
      setStartDate(value);
      setEndDate("");
      return;
    }

    setEndDate(value);
  };

  const saveRange = () => {
    if (!startDate || !endDate) {
      alert("Select a start and end date for the leave range.");
      return;
    }

    const dates = getRangeDates(startDate, endDate);
    const newRecords = dates.map((date) => ({
      id: `${selectedEmployee.id}-${date}-${Date.now()}-${Math.random()}`,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      date,
      type: leaveType,
      status: "Approved",
      source: "admin",
      reason: `Admin scheduled ${leaveType.toLowerCase()} leave`,
      createdAt: new Date().toISOString()
    }));

    setLeaves((prev) => [
      ...prev.filter(
        (leave) => !(leave.employeeId === selectedEmployee.id && dates.includes(leave.date) && leave.source === "admin")
      ),
      ...newRecords
    ]);

    setStartDate("");
    setEndDate("");
    alert("Leave dates were added to employee leave register.");
  };

  return (
    <section className="content-card">
      <div className="calendar-toolbar">
        <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)}>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name} ({employee.id})
            </option>
          ))}
        </select>

        <div className="leave-type-buttons">
          {LEAVE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={leaveType === type ? `leave-type active ${type.toLowerCase()}` : "leave-type"}
              onClick={() => setLeaveType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="selected-count">Range: {selectedDates.length} days</div>
      </div>

      <div className="calendar-export-row">
        <ExportControls employees={employees} leaves={leaves} />
      </div>

      <div className="range-picker">
        <div>
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="employee-summary">
        <div className="summary-person">
          <div className="large-avatar">{selectedEmployee.name.charAt(0).toUpperCase()}</div>
          <div>
            <h3>{selectedEmployee.name}</h3>
            <p>{selectedEmployee.designation}</p>
          </div>
        </div>
        <div>
          <span>Employee ID</span>
          <strong>{selectedEmployee.id}</strong>
        </div>
        <div>
          <span>Entitlement</span>
          <strong>{selectedEmployee.entitlement} days</strong>
        </div>
        <div>
          <span>Joined</span>
          <strong>{formatDate(selectedEmployee.joiningDate)}</strong>
        </div>
      </div>

      <div className="calendar-header">
        <button type="button" onClick={() => setMonth((prev) => (prev === 0 ? 11 : prev - 1))}>←</button>
        <h2>
          {monthNames[month]} {year}
        </h2>
        <button type="button" onClick={() => setMonth((prev) => (prev === 11 ? 0 : prev + 1))}>→</button>
      </div>

      <div className="year-tabs">
        {[year - 1, year, year + 1].map((yearOption) => (
          <button key={yearOption} type="button" className={year === yearOption ? "active" : ""} onClick={() => setYear(yearOption)}>
            {yearOption}
          </button>
        ))}
      </div>

      <div className="calendar-grid">
        {dayNames.map((name) => (
          <div key={name} className="calendar-day-name">
            {name}
          </div>
        ))}

        {monthCells.map((day) => {
          const iso = formatISO(day);
          const isCurrentMonth = day.getMonth() === month;
          const isBeforeJoining = iso < selectedEmployee.joiningDate;
          const isSelected = selectedDates.includes(iso);
          const adminLeave = employeeLeaves.find((leave) => leave.date === iso);

          const classes = [
            "calendar-cell",
            isCurrentMonth ? "" : "empty",
            isBeforeJoining ? "before-joining" : "",
            day.getDay() === 5 ? "friday" : "",
            isSelected ? "selected-date" : "",
            adminLeave ? `has-${adminLeave.type.toLowerCase()}` : ""
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button key={iso} type="button" disabled={!isCurrentMonth} className={classes} onClick={() => handleCellClick(day)}>
              <span className="date-number">{day.getDate()}</span>
              {adminLeave && <span className="leave-badge">{adminLeave.type}</span>}
              {isSelected && <span className="selected-mark">Selected</span>}
            </button>
          );
        })}
      </div>

      <div className="calendar-actions">
        <button type="button" className="primary-small" onClick={saveRange}>
          Save leave dates to register
        </button>
      </div>
    </section>
  );
}

function RequestsPage({ employees, leaves, setLeaves }) {
  const pending = leaves.filter((leave) => leave.source === "employee" && leave.status === "Pending");

  const updateStatus = (leaveId, status) => {
    setLeaves((prev) => prev.map((leave) => (leave.id === leaveId ? { ...leave, status } : leave)));
  };

  return (
    <section className="content-card">
      <div className="section-header">
        <div>
          <h3>Leave Requests</h3>
          <p>Approve or reject employee requests.</p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="empty-state">No pending requests.</div>
      ) : (
        <div className="leave-history">
          <div className="history-header request-header">
            <span>Employee</span>
            <span>Date</span>
            <span>Type</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {pending.map((leave) => {
            const employee = employees.find((person) => person.id === leave.employeeId);
            return (
              <div key={leave.id} className="history-row request-row">
                <div>
                  <strong>{employee ? employee.name : leave.employeeName}</strong>
                  <small>{leave.employeeId}</small>
                </div>
                <div>{formatDate(leave.date)}</div>
                <div>
                  <span className={`table-leave ${leave.type.toLowerCase()}`}>{leave.type}</span>
                </div>
                <div>
                  <span className="status pending">Pending</span>
                </div>
                <div className="request-actions">
                  <button type="button" className="approve-btn" onClick={() => updateStatus(leave.id, "Approved")}>
                    Approve
                  </button>
                  <button type="button" className="reject-btn" onClick={() => updateStatus(leave.id, "Rejected")}>
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function EmployeePortal({ employee, leaves, setLeaves, logout }) {
  const [form, setForm] = useState({
    type: "Paid",
    startDate: "",
    endDate: "",
    reason: ""
  });

  if (!employee) {
    return <div className="content-card empty-state">No employee profile found.</div>;
  }

  const employeeLeaves = leaves.filter((leave) => leave.employeeId === employee.id);

  const submitRequest = (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end < start) {
      alert("End date must be after the start date.");
      return;
    }

    const dates = getRangeDates(form.startDate, form.endDate);
    const existingDates = employeeLeaves.filter((leave) => leave.status !== "Rejected").map((leave) => leave.date);

    for (const date of dates) {
      if (date < employee.joiningDate) {
        alert("Leave cannot be requested before joining date.");
        return;
      }
      if (existingDates.includes(date)) {
        alert(`Leave already exists for ${formatDate(date)}.`);
        return;
      }
    }

    const newRecords = dates.map((date) => ({
      id: `${employee.id}-${date}-${Date.now()}-${Math.random()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      date,
      type: form.type,
      status: "Pending",
      source: "employee",
      reason: form.reason || "No reason specified",
      createdAt: new Date().toISOString()
    }));

    setLeaves((prev) => [...prev, ...newRecords]);
    setForm({ type: "Paid", startDate: "", endDate: "", reason: "" });
    alert("Leave request submitted successfully.");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo small">LM</div>
          <div>
            <strong>Leave Manager</strong>
            <small>EMPLOYEE PORTAL</small>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="logged-user">
            <div className="avatar">{employee.name.charAt(0).toUpperCase()}</div>
            <div>
              <strong>{employee.name}</strong>
              <small>{employee.designation}</small>
            </div>
          </div>
          <button type="button" className="logout-btn" onClick={logout}>
            ⇥ Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-card employee-profile">
          <div className="profile-heading">
            <div className="large-avatar">{employee.name.charAt(0).toUpperCase()}</div>
            <div>
              <h2>{employee.name}</h2>
              <p>{employee.designation}</p>
            </div>
          </div>

          <div className="profile-grid">
            <div className="info-item">
              <span>Employee ID</span>
              <strong>{employee.id}</strong>
            </div>
            <div className="info-item">
              <span>Joining Date</span>
              <strong>{formatDate(employee.joiningDate)}</strong>
            </div>
            <div className="info-item">
              <span>Leave Balance</span>
              <strong>{getEmployeeSummary(employee, leaves).balance} days</strong>
            </div>
          </div>
        </div>

        <section className="content-card leave-request-form">
          <div className="section-header">
            <div>
              <h3>Request Leave</h3>
              <p>Submit your leave dates and reason.</p>
            </div>
          </div>

          <form onSubmit={submitRequest}>
            <div className="leave-selection">
              <div>
                <label>Leave Type</label>
                <div className="leave-type-buttons">
                  {LEAVE_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={form.type === type ? `leave-type active ${type.toLowerCase()}` : "leave-type"}
                      onClick={() => setForm({ ...form, type })}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div>
                <label>Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div>
                <label>End Date</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
              </div>
            </div>

            <label>Reason</label>
            <textarea rows="4" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            <button type="submit" className="primary-btn">
              Submit Leave Request
            </button>
          </form>
        </section>

        <section className="content-card">
          <div className="section-header">
            <div>
              <h3>Leave History</h3>
              <p>Your recent leave requests and statuses.</p>
            </div>
          </div>

          {employeeLeaves.length === 0 ? (
            <div className="empty-state">No leave records yet.</div>
          ) : (
            <div className="leave-history">
              <div className="history-header">
                <span>Date</span>
                <span>Type</span>
                <span>Reason</span>
                <span>Status</span>
              </div>

              {employeeLeaves.map((leave) => (
                <div key={leave.id} className="history-row">
                  <div>{formatDate(leave.date)}</div>
                  <div>
                    <span className={`table-leave ${leave.type.toLowerCase()}`}>{leave.type}</span>
                  </div>
                  <div>{leave.reason}</div>
                  <div>
                    <span className={`status ${leave.status.toLowerCase()}`}>{leave.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function getMonthCells(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());

  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    cells.push(date);
  }
  return cells;
}

function getRangeDates(startDate, endDate) {
  if (!startDate || !endDate) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    dates.push(formatISO(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function getEmployeeSummary(employee, leaves, asOfDate = formatISO(new Date())) {
  const employeeLeaves = leaves.filter(
    (leave) => leave.employeeId === employee.id && leave.status === "Approved" && leave.date <= asOfDate
  );
  const counts = { paid: 0, medical: 0, unpaid: 0, other: 0 };

  employeeLeaves.forEach((leave) => {
    const key = leave.type.toLowerCase();
    if (counts[key] !== undefined) {
      counts[key] += 1;
    }
  });

  const entitlement = Number(employee.entitlement || 0);
  const accrued = calculateAccruedLeave(employee.joiningDate, asOfDate, entitlement);
  const taken = employeeLeaves.length;
  const balance = Math.max(0, accrued - taken);

  return {
    paid: counts.paid,
    medical: counts.medical,
    unpaid: counts.unpaid,
    other: counts.other,
    taken,
    accrued: Number(accrued.toFixed(1)),
    balance: Number(balance.toFixed(1))
  };
}

function calculateAccruedLeave(joiningDate, asOfDate, annualEntitlement) {
  if (!joiningDate || joiningDate > asOfDate || annualEntitlement <= 0) return 0;

  const startYear = Number(joiningDate.slice(0, 4));
  const endYear = Number(asOfDate.slice(0, 4));
  let accrued = 0;

  for (let year = startYear; year <= endYear; year += 1) {
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    const eligibleStart = joiningDate > yearStart ? joiningDate : yearStart;
    const eligibleEnd = asOfDate < yearEnd ? asOfDate : yearEnd;
    const eligibleDays = utcDayNumber(eligibleEnd) - utcDayNumber(eligibleStart) + 1;
    const daysInYear = utcDayNumber(yearEnd) - utcDayNumber(yearStart) + 1;
    accrued += (eligibleDays / daysInYear) * annualEntitlement;
  }

  return accrued;
}

function utcDayNumber(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

function getEmployeeIdentityValue(employee, identityType) {
  if (identityType === "passport") {
    return employee.passport || (employee.identityType === "passport" ? employee.identityNumber : "");
  }
  return employee.civilId || (employee.identityType !== "passport" ? employee.identityNumber : "");
}

function downloadLeaveData(employees, leaves, filters) {
  const asOfDate = formatISO(new Date());
  const rows = buildLeaveWorkbookRows(employees, leaves, asOfDate, filters);
  const blob = new Blob([buildXlsxArchive(rows)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `employee-leave-details-${filters.employeeId}-${filters.year}-${filters.month}-${asOfDate}.xlsx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function buildLeaveWorkbookRows(employees, leaves, asOfDate, filters = {}) {
  const { employeeId = "all", year = "all", month = "all" } = filters;
  const headers = [
    "Employee ID", "Employee Name", "Designation", "Joining Date", "Identification Type", "Identification Number",
    "Annual Entitlement", "Accrued Leave", "Leave Balance", "Leave Taken", "Leave Date", "Leave Type", "Status", "Source", "Reason"
  ];
  const selectedEmployees = employeeId === "all" ? employees : employees.filter((employee) => employee.id === employeeId);
  const rows = selectedEmployees.flatMap((employee) => {
    const identityType = employee.identityType || (employee.passport ? "passport" : "civilId");
    const identityNumber = getEmployeeIdentityValue(employee, identityType);
    const summary = getEmployeeSummary(employee, leaves, asOfDate);
    const employeeLeaves = leaves.filter((leave) => {
      if (leave.employeeId !== employee.id) return false;
      const [leaveYear, leaveMonth] = leave.date.split("-").map(Number);
      return (year === "all" || leaveYear === Number(year)) && (month === "all" || leaveMonth === Number(month));
    });
    const records = employeeLeaves.length ? employeeLeaves : [null];

    return records.map((leave) => [
      employee.id,
      employee.name,
      employee.designation,
      employee.joiningDate,
      identityType === "passport" ? "Passport" : "Civil ID",
      identityNumber,
      employee.entitlement,
      summary.accrued,
      summary.balance,
      summary.taken,
      leave?.date || "",
      leave?.type || "",
      leave?.status || "",
      leave?.source === "admin" ? "Admin register" : leave?.source === "employee" ? "Employee request" : "",
      leave?.reason || ""
    ]);
  });
  return [headers, ...rows];
}

function buildXlsxArchive(rows) {
  const files = [
    {
      name: "[Content_Types].xml",
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'
    },
    {
      name: "_rels/.rels",
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'
    },
    {
      name: "xl/workbook.xml",
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Leave Details" sheetId="1" r:id="rId1"/></sheets></workbook>'
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'
    },
    { name: "xl/worksheets/sheet1.xml", content: buildWorksheetXml(rows) }
  ];
  return zipStore(files);
}

function buildWorksheetXml(rows) {
  const worksheetRows = rows.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      const reference = `${getColumnName(columnIndex + 1)}${rowIndex + 1}`;
      if (typeof value === "number" && Number.isFinite(value)) {
        return `<c r="${reference}"><v>${value}</v></c>`;
      }
      return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
    }).join("");
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${worksheetRows}</sheetData></worksheet>`;
}

function getColumnName(columnNumber) {
  let number = columnNumber;
  let name = "";
  while (number > 0) {
    const remainder = (number - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    number = Math.floor((number - 1) / 26);
  }
  return name;
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function zipStore(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach(({ name, content }) => {
    const nameBytes = encoder.encode(name);
    const dataBytes = encoder.encode(content);
    const checksum = crc32(dataBytes);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, dataBytes.length, true);
    localView.setUint32(22, dataBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localHeader.set(nameBytes, 30);
    localParts.push(localHeader, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, dataBytes.length, true);
    centralView.setUint32(24, dataBytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    centralParts.push(centralHeader);
    offset += localHeader.length + dataBytes.length;
  });

  const centralDirectory = concatenateBytes(centralParts);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralDirectory.length, true);
  endView.setUint32(16, offset, true);
  return concatenateBytes([...localParts, centralDirectory, endRecord]);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  bytes.forEach((byte) => {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  });
  return (crc ^ 0xffffffff) >>> 0;
}

function concatenateBytes(parts) {
  const totalLength = parts.reduce((total, part) => total + part.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });
  return result;
}

function formatISO(date) {
  const value = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return value.toISOString().slice(0, 10);
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export { buildLeaveWorkbookRows, buildXlsxArchive, getEmployeeSummary };
export default App;
