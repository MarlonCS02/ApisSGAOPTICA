import { jest } from "@jest/globals";

const AppointmentMock = { findAll: jest.fn(), findAndCountAll: jest.fn(), findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn() };
const CustomerMock = { findByPk: jest.fn() };
const OptometristMock = { findByPk: jest.fn() };
const ExamTypeMock = { findByPk: jest.fn() };
const NotificationMock = { create: jest.fn(), update: jest.fn(), findAll: jest.fn() };

jest.unstable_mockModule("../../models/appointment.model.js", () => ({ default: AppointmentMock }));
jest.unstable_mockModule("../../models/customer.model.js", () => ({ default: CustomerMock }));
jest.unstable_mockModule("../../models/optometrist.model.js", () => ({ default: OptometristMock }));
jest.unstable_mockModule("../../models/examType.model.js", () => ({ default: ExamTypeMock }));
jest.unstable_mockModule("../../models/notification.model.js", () => ({ default: NotificationMock }));

const {
  createAppointment, getAppointments, getAppointmentById,
  getAppointmentsByCustomer, updateAppointment,
  cancelAppointment, deleteAppointment, getAppointmentReminders
} = await import("../../controllers/appointment.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("AppointmentController - createAppointment", () => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const validBody = { date: tomorrow, time: "10:00:00", customer_id: 1, exam_type_id: 1, optometrist_id: 1 };

  test("400: faltan campos requeridos", async () => {
    const res = mockRes();
    await createAppointment({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400: fecha en el pasado", async () => {
    const res = mockRes();
    await createAppointment({ body: { ...validBody, date: "2020-01-01" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Cannot create appointments in past dates" }));
  });

  test("404: cliente no existe", async () => {
    CustomerMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createAppointment({ body: validBody }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Customer not found" }));
  });

  test("404: optometrista no existe", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1 });
    OptometristMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createAppointment({ body: validBody }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Optometrist not found" }));
  });

  test("404: tipo de examen no existe", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1 });
    OptometristMock.findByPk.mockResolvedValue({ id: 1 });
    ExamTypeMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createAppointment({ body: validBody }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Exam type not found" }));
  });

  test("409: conflicto de horario con optometrista", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1 });
    OptometristMock.findByPk.mockResolvedValue({ id: 1 });
    ExamTypeMock.findByPk.mockResolvedValue({ id: 1 });
    AppointmentMock.findOne.mockResolvedValue({ appointment_id: 99 });
    const res = mockRes();
    await createAppointment({ body: validBody }, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("conflict") }));
  });

  test("201: cita creada exitosamente", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1, firstName: "Juan", firstLastName: "Pérez" });
    OptometristMock.findByPk.mockResolvedValue({ id: 1 });
    ExamTypeMock.findByPk.mockResolvedValue({ id: 1 });
    AppointmentMock.findOne.mockResolvedValue(null);
    const newAppt = { appointment_id: 10, ...validBody };
    AppointmentMock.create.mockResolvedValue(newAppt);
    AppointmentMock.findByPk.mockResolvedValue(newAppt);
    NotificationMock.create.mockResolvedValue({});
    const res = mockRes();
    await createAppointment({ body: validBody }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Appointment created successfully. A reminder has been generated and is pending." }));
  });
});

describe("AppointmentController - getAppointments", () => {
  test("200: retorna citas paginadas", async () => {
    AppointmentMock.findAndCountAll.mockResolvedValue({ count: 3, rows: [] });
    const res = mockRes();
    await getAppointments({ query: { page: 1, limit: 10 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalItems: 3 }));
  });

  test("200: filtra por status", async () => {
    AppointmentMock.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });
    const res = mockRes();
    await getAppointments({ query: { status: "pendiente" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("500: maneja error de BD", async () => {
    AppointmentMock.findAndCountAll.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getAppointments({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("AppointmentController - getAppointmentById", () => {
  test("200: retorna cita por ID", async () => {
    AppointmentMock.findByPk.mockResolvedValue({ appointment_id: 1 });
    const res = mockRes();
    await getAppointmentById({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("404: cita no encontrada", async () => {
    AppointmentMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getAppointmentById({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Appointment not found" }));
  });
});

describe("AppointmentController - getAppointmentsByCustomer", () => {
  test("404: cliente no existe", async () => {
    CustomerMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getAppointmentsByCustomer({ params: { id: 99 }, query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("200: retorna citas del cliente", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1, firstName: "Ana", firstLastName: "López" });
    AppointmentMock.findAndCountAll.mockResolvedValue({ count: 2, rows: [] });
    const res = mockRes();
    await getAppointmentsByCustomer({ params: { id: 1 }, query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalItems: 2 }));
  });
});

describe("AppointmentController - updateAppointment", () => {
  test("404: cita no encontrada", async () => {
    AppointmentMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await updateAppointment({ params: { id: 99 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("400: no se puede modificar cita cancelada", async () => {
    AppointmentMock.findByPk.mockResolvedValue({ appointment_id: 1, status: "cancelada" });
    const res = mockRes();
    await updateAppointment({ params: { id: 1 }, body: { status: "pendiente" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Cannot modify a cancelled appointment" }));
  });

  test("200: actualiza cita exitosamente", async () => {
    const appt = { appointment_id: 1, status: "pendiente", date: "2099-01-01", time: "10:00", optometrist_id: 1, update: jest.fn().mockResolvedValue(true) };
    AppointmentMock.findByPk.mockResolvedValueOnce(appt).mockResolvedValueOnce(appt);
    AppointmentMock.findOne.mockResolvedValue(null);
    const res = mockRes();
    await updateAppointment({ params: { id: 1 }, body: { status: "confirmada" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("AppointmentController - cancelAppointment", () => {
  test("404: cita no encontrada", async () => {
    AppointmentMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await cancelAppointment({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("400: cita ya cancelada", async () => {
    AppointmentMock.findByPk.mockResolvedValue({ appointment_id: 1, status: "cancelada" });
    const res = mockRes();
    await cancelAppointment({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "The appointment is already cancelled" }));
  });

  test("400: cita ya completada", async () => {
    AppointmentMock.findByPk.mockResolvedValue({ appointment_id: 1, status: "completada" });
    const res = mockRes();
    await cancelAppointment({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "The appointment is already completed" }));
  });

  test("400: no se puede cancelar cita pasada", async () => {
    AppointmentMock.findByPk.mockResolvedValue({ appointment_id: 1, status: "pendiente", date: "2020-01-01" });
    const res = mockRes();
    await cancelAppointment({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Cannot cancel an appointment from a past date" }));
  });

  test("200: cancela cita exitosamente", async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const appt = { appointment_id: 1, status: "pendiente", date: futureDate, update: jest.fn().mockResolvedValue(true) };
    AppointmentMock.findByPk.mockResolvedValueOnce(appt).mockResolvedValueOnce(appt);
    NotificationMock.update.mockResolvedValue([1]);
    const res = mockRes();
    await cancelAppointment({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Appointment cancelled successfully. The associated reminders have been cancelled." }));
  });
});

describe("AppointmentController - deleteAppointment", () => {
  test("404: cita no encontrada", async () => {
    AppointmentMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await deleteAppointment({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("400: no se puede eliminar cita completada", async () => {
    AppointmentMock.findByPk.mockResolvedValue({ appointment_id: 1, status: "completada" });
    const res = mockRes();
    await deleteAppointment({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Cannot delete a completed appointment" }));
  });

  test("200: elimina cita exitosamente", async () => {
    const appt = { appointment_id: 5, status: "pendiente", date: "2099-06-01", time: "09:00", destroy: jest.fn().mockResolvedValue(true) };
    AppointmentMock.findByPk.mockResolvedValue(appt);
    NotificationMock.update.mockResolvedValue([1]);
    const res = mockRes();
    await deleteAppointment({ params: { id: 5 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Appointment deleted permanently" }));
  });
});

describe("AppointmentController - getAppointmentReminders", () => {
  test("404: cita no encontrada", async () => {
    AppointmentMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getAppointmentReminders({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("200: retorna recordatorios de la cita", async () => {
    AppointmentMock.findByPk.mockResolvedValue({ appointment_id: 1, date: "2099-06-15", time: "10:00", status: "pendiente" });
    NotificationMock.findAll.mockResolvedValue([{ notification_id: 1 }, { notification_id: 2 }]);
    const res = mockRes();
    await getAppointmentReminders({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalRecordatorios: 2 }));
  });
});
