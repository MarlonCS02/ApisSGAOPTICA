import { jest } from "@jest/globals";

const NotificationMock = { findAndCountAll: jest.fn(), findByPk: jest.fn(), create: jest.fn(), update: jest.fn() };
const CustomerMock = { findByPk: jest.fn() };
const AppointmentMock = { findByPk: jest.fn() };

jest.unstable_mockModule("../../models/notification.model.js", () => ({ default: NotificationMock }));
jest.unstable_mockModule("../../models/customer.model.js", () => ({ default: CustomerMock }));
jest.unstable_mockModule("../../models/appointment.model.js", () => ({ default: AppointmentMock }));

const {
  getAllNotifications, getNotificationById, createNotification,
  updateNotification, markAsSent, markAsRead,
  getNotificationsByCustomer, deleteNotification, permanentDeleteNotification
} = await import("../../controllers/notification.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("NotificationController - getAllNotifications", () => {
  test("200: retorna notificaciones paginadas", async () => {
    NotificationMock.findAndCountAll.mockResolvedValue({ count: 3, rows: [] });
    const res = mockRes();
    await getAllNotifications({ query: { page: 1, limit: 10 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalItems: 3 }));
  });
  test("200: filtra por type y status", async () => {
    NotificationMock.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });
    const res = mockRes();
    await getAllNotifications({ query: { type: "EMAIL", status: "SENT" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("500: maneja error de BD", async () => {
    NotificationMock.findAndCountAll.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getAllNotifications({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("NotificationController - getNotificationById", () => {
  test("200: retorna notificación por ID", async () => {
    NotificationMock.findByPk.mockResolvedValue({ notification_id: 1, type: "EMAIL" });
    const res = mockRes();
    await getNotificationById({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("404: notificación no encontrada", async () => {
    NotificationMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getNotificationById({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Notification not found" }));
  });
});

describe("NotificationController - createNotification", () => {
  test("400: faltan campos requeridos (customer_id y message)", async () => {
    const res = mockRes();
    await createNotification({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "The fields 'customer_id' and 'message' are required" }));
  });
  test("404: cliente no existe", async () => {
    CustomerMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createNotification({ body: { customer_id: 99, message: "Hola" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Customer not found" }));
  });
  test("404: cita no existe si se provee appointment_id", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1 });
    AppointmentMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createNotification({ body: { customer_id: 1, message: "Recordatorio", appointment_id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Appointment not found" }));
  });
  test("400: tipo de notificación inválido", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1 });
    const res = mockRes();
    await createNotification({ body: { customer_id: 1, message: "Hola", type: "TIPO_INVALIDO" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("Invalid notification type") }));
  });
  test("201: crea notificación exitosamente", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1 });
    const notif = { notification_id: 5 };
    NotificationMock.create.mockResolvedValue(notif);
    NotificationMock.findByPk.mockResolvedValue(notif);
    const res = mockRes();
    await createNotification({ body: { customer_id: 1, message: "Recuerde su cita", type: "SYSTEM" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Notification created successfully" }));
  });
});

describe("NotificationController - updateNotification", () => {
  test("404: notificación no encontrada", async () => {
    NotificationMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await updateNotification({ params: { id: 99 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Notificación no encontrada" }));
  });
  test("400: tipo inválido en update", async () => {
    NotificationMock.findByPk.mockResolvedValue({ notification_id: 1 });
    const res = mockRes();
    await updateNotification({ params: { id: 1 }, body: { type: "TIPO_MAL" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test("400: status inválido en update", async () => {
    NotificationMock.findByPk.mockResolvedValue({ notification_id: 1 });
    const res = mockRes();
    await updateNotification({ params: { id: 1 }, body: { status: "STATUS_MALO" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test("200: actualiza notificación exitosamente", async () => {
    const notif = { notification_id: 1, update: jest.fn().mockResolvedValue(true) };
    NotificationMock.findByPk.mockResolvedValueOnce(notif).mockResolvedValueOnce({ notification_id: 1, status: "READ" });
    const res = mockRes();
    await updateNotification({ params: { id: 1 }, body: { status: "READ" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Notification updated successfully" }));
  });
});

describe("NotificationController - markAsSent", () => {
  test("404: no encontrada", async () => {
    NotificationMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await markAsSent({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("200: marca como enviada", async () => {
    const notif = { notification_id: 1, update: jest.fn().mockResolvedValue(true) };
    NotificationMock.findByPk.mockResolvedValueOnce(notif).mockResolvedValueOnce({ notification_id: 1, status: "SENT" });
    const res = mockRes();
    await markAsSent({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Notification marked as sent" }));
  });
});

describe("NotificationController - markAsRead", () => {
  test("404: no encontrada", async () => {
    NotificationMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await markAsRead({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("200: marca como leída", async () => {
    const notif = { notification_id: 1, status: "SENT", update: jest.fn().mockResolvedValue(true) };
    NotificationMock.findByPk.mockResolvedValue(notif);
    const res = mockRes();
    await markAsRead({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Notification marked as read" }));
  });
});

describe("NotificationController - getNotificationsByCustomer", () => {
  test("404: cliente no existe", async () => {
    CustomerMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getNotificationsByCustomer({ params: { id: 99 }, query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Customer not found" }));
  });
  test("200: retorna notificaciones del cliente", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1, firstName: "Juan", firstLastName: "Pérez" });
    NotificationMock.findAndCountAll.mockResolvedValue({ count: 2, rows: [{ status: "SENT" }, { status: "READ" }] });
    const res = mockRes();
    await getNotificationsByCustomer({ params: { id: 1 }, query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalItems: 2 }));
  });
});

describe("NotificationController - deleteNotification (soft delete)", () => {
  test("404: no encontrada", async () => {
    NotificationMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await deleteNotification({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("200: cancela notificación (soft delete)", async () => {
    const notif = { notification_id: 1, update: jest.fn().mockResolvedValue(true) };
    NotificationMock.findByPk.mockResolvedValue(notif);
    const res = mockRes();
    await deleteNotification({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Notification deleted successfully" }));
  });
});

describe("NotificationController - permanentDeleteNotification", () => {
  test("404: no encontrada", async () => {
    NotificationMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await permanentDeleteNotification({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("200: elimina permanentemente", async () => {
    NotificationMock.findByPk.mockResolvedValue({ notification_id: 1, destroy: jest.fn().mockResolvedValue(true) });
    const res = mockRes();
    await permanentDeleteNotification({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Notification deleted permanently" }));
  });
});
