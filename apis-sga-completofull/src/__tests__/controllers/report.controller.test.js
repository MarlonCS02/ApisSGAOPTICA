import { jest } from "@jest/globals";

const NotificationMock = { findAll: jest.fn() };
const AppointmentMock = { findAll: jest.fn() };

jest.unstable_mockModule("../../models/notification.model.js", () => ({ default: NotificationMock }));
jest.unstable_mockModule("../../models/appointment.model.js", () => ({ default: AppointmentMock }));
jest.unstable_mockModule("../../models/customer.model.js", () => ({ default: {} }));
jest.unstable_mockModule("../../models/user.model.js", () => ({ default: {} }));
jest.unstable_mockModule("../../models/userEntity.model.js", () => ({ default: {} }));

const { getAppointmentNotificationsReport, getAppointmentsStatusReport, getRemindersHistory } = await import("../../controllers/report.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("ReportController - getAppointmentNotificationsReport", () => {
  test("400: faltan startDate y endDate", async () => {
    const res = mockRes();
    await getAppointmentNotificationsReport({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Se requieren startDate y endDate" }));
  });

  test("400: fechas inválidas", async () => {
    const res = mockRes();
    await getAppointmentNotificationsReport({ query: { startDate: "fecha-mala", endDate: "otra-mala" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Fechas inválidas" }));
  });

  test("200: genera reporte de notificaciones exitosamente", async () => {
    NotificationMock.findAll.mockResolvedValue([
      { type: "APPOINTMENT_REMINDER", status: "SENT", sent_at: "2025-06-01T10:00:00Z" },
      { type: "APPOINTMENT_CONFIRMED", status: "SENT", sent_at: "2025-06-02T10:00:00Z" },
    ]);
    const res = mockRes();
    await getAppointmentNotificationsReport({ query: { startDate: "2025-06-01", endDate: "2025-06-30" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("500: maneja error de BD", async () => {
    NotificationMock.findAll.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await getAppointmentNotificationsReport({ query: { startDate: "2025-06-01", endDate: "2025-06-30" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("ReportController - getAppointmentsStatusReport", () => {
  test("400: faltan startDate y endDate", async () => {
    const res = mockRes();
    await getAppointmentsStatusReport({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Se requieren startDate y endDate" }));
  });

  test("200: genera reporte de estado de citas exitosamente", async () => {
    AppointmentMock.findAll.mockResolvedValue([
      { date: "2025-06-10", time: "10:00:00", status: "pendiente" },
      { date: "2025-06-10", time: "11:00:00", status: "completada" },
      { date: "2025-06-11", time: "09:00:00", status: "cancelada" },
    ]);
    const res = mockRes();
    await getAppointmentsStatusReport({ query: { startDate: "2025-06-01", endDate: "2025-06-30" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      resumen: expect.objectContaining({ total: 3, pendientes: 1, completadas: 1, canceladas: 1 }),
    }));
  });

  test("500: maneja error de BD", async () => {
    AppointmentMock.findAll.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await getAppointmentsStatusReport({ query: { startDate: "2025-06-01", endDate: "2025-06-30" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("ReportController - getRemindersHistory", () => {
  test("200: retorna historial sin filtros", async () => {
    NotificationMock.findAll.mockResolvedValue([
      { status: "SENT" }, { status: "PENDING" }, { status: "FAILED" },
    ]);
    const res = mockRes();
    await getRemindersHistory({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      estadisticas: expect.objectContaining({ total: 3, enviados: 1, pendientes: 1, fallidos: 1 }),
    }));
  });

  test("200: filtra por customerId", async () => {
    NotificationMock.findAll.mockResolvedValue([{ status: "SENT" }]);
    const res = mockRes();
    await getRemindersHistory({ query: { customerId: "5" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("200: filtra por rango de fechas", async () => {
    NotificationMock.findAll.mockResolvedValue([]);
    const res = mockRes();
    await getRemindersHistory({ query: { startDate: "2025-06-01", endDate: "2025-06-30" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("500: maneja error de BD", async () => {
    NotificationMock.findAll.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await getRemindersHistory({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
