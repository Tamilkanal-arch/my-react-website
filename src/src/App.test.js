import { fireEvent, render, screen } from "@testing-library/react";
import { TextDecoder, TextEncoder } from "util";
import App, { buildLeaveWorkbookRows, buildXlsxArchive, getEmployeeSummary } from "./App";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

beforeEach(() => {
  localStorage.clear();
  jest.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("renders the leave manager login", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: "Leave Manager" })).toBeInTheDocument();
  expect(screen.getByText("Default Admin Login")).toBeInTheDocument();
});

test("allows an employee to be added without an identification number", () => {
  render(<App />);
  fireEvent.change(screen.getByPlaceholderText("admin@company.com"), { target: { value: "admin@company.com" } });
  fireEvent.change(screen.getByPlaceholderText("enter password"), { target: { value: "admin123" } });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));
  fireEvent.click(screen.getByRole("button", { name: /employees & names/i }));

  fireEvent.change(screen.getByLabelText(/employee id/i), { target: { value: "EMP003" } });
  fireEvent.change(screen.getByLabelText(/employee name/i), { target: { value: "Sam Lee" } });
  fireEvent.change(screen.getByLabelText(/joining date/i), { target: { value: "2026-01-01" } });
  fireEvent.change(screen.getByLabelText(/leave entitlement/i), { target: { value: "30" } });
  fireEvent.click(screen.getByRole("button", { name: /add employee/i }));

  const employees = JSON.parse(localStorage.getItem("leaveEmployees"));
  expect(employees.find((employee) => employee.id === "EMP003")).toMatchObject({
    name: "Sam Lee",
    identityNumber: "",
    civilId: "",
    passport: ""
  });
});

test("carries accrued leave forward and counts only approved leave through the as-of date", () => {
  const employee = { id: "EMP001", joiningDate: "2025-07-01", entitlement: 30 };
  const leaves = [
    { employeeId: "EMP001", date: "2026-01-10", type: "Paid", status: "Approved" },
    { employeeId: "EMP001", date: "2027-06-30", type: "Unpaid", status: "Approved" },
    { employeeId: "EMP001", date: "2027-06-29", type: "Medical", status: "Pending" },
    { employeeId: "EMP001", date: "2027-07-01", type: "Paid", status: "Approved" }
  ];

  expect(getEmployeeSummary(employee, leaves, "2027-06-30")).toMatchObject({
    accrued: 60,
    taken: 2,
    balance: 58,
    paid: 1,
    unpaid: 1,
    medical: 0
  });
});

test("filters exported workbook rows by employee, year, and month", () => {
  const employees = [
    { id: "EMP001", name: "Daniel", joiningDate: "2025-01-01", entitlement: 30, civilId: "12345" },
    { id: "EMP002", name: "Sam", joiningDate: "2026-01-01", entitlement: 24, passport: "P-987" }
  ];
  const leaves = [
    { employeeId: "EMP001", date: "2026-02-01", type: "Paid", status: "Approved", source: "admin", reason: "Scheduled" },
    { employeeId: "EMP002", date: "2026-03-01", type: "Medical", status: "Pending", source: "employee", reason: "Appointment" }
  ];

  const rows = buildLeaveWorkbookRows(employees, leaves, "2026-09-30", {
    employeeId: "EMP002",
    year: "2026",
    month: "3"
  });

  expect(rows).toHaveLength(2);
  expect(rows[1]).toContain("EMP002");
  expect(rows[1]).toContain("Sam");
  expect(rows[1]).toContain("Passport");
  expect(rows[1]).toContain("P-987");
  expect(rows[1]).toContain("Employee request");
  expect(rows[1]).not.toContain("EMP001");
});

test("creates a valid XLSX ZIP archive containing the workbook and leave details", () => {
  const rows = buildLeaveWorkbookRows(
    [{ id: "EMP001", name: "Daniel", joiningDate: "2025-01-01", entitlement: 30 }],
    [{ employeeId: "EMP001", date: "2026-02-01", type: "Paid", status: "Approved", source: "admin", reason: "Scheduled" }],
    "2026-09-30"
  );
  const archive = buildXlsxArchive(rows);
  const archiveText = new TextDecoder().decode(archive);

  expect(Array.from(archive.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
  expect(archiveText).toContain("xl/workbook.xml");
  expect(archiveText).toContain("Leave Details");
  expect(archiveText).toContain("Scheduled");
});
