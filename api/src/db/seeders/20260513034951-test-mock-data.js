"use strict";
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const password = await bcrypt.hash("password123", 10);
    const emails = [
      "doctor@healty.com",
      "recepcion@healty.com",
      "paciente1@healty.com",
      "paciente2@healty.com",
    ];

    // 1. Insert Users
    await queryInterface.bulkInsert("users", [
      {
        email: emails[0],
        password,
        is_active: true,
        created_date: new Date(),
        updated_date: new Date(),
      },
      {
        email: emails[1],
        password,
        is_active: true,
        created_date: new Date(),
        updated_date: new Date(),
      },
      {
        email: emails[2],
        password,
        is_active: true,
        created_date: new Date(),
        updated_date: new Date(),
      },
      {
        email: emails[3],
        password,
        is_active: true,
        created_date: new Date(),
        updated_date: new Date(),
      },
    ]);

    // Fetch inserted users and roles
    const users = (
      await queryInterface.sequelize.query(
        `SELECT id, email FROM users WHERE email IN ('${emails.join("','")}');`,
      )
    )[0];
    const roles = (
      await queryInterface.sequelize.query(`SELECT id, name FROM roles;`)
    )[0];

    const getUserId = (email) => users.find((u) => u.email === email).id;
    const getRoleId = (name) => roles.find((r) => r.name === name).id;

    // 2. Map user_roles
    await queryInterface.bulkInsert("user_roles", [
      { user_id: getUserId(emails[0]), role_id: getRoleId("Professional") },
      { user_id: getUserId(emails[1]), role_id: getRoleId("Receptionist") },
      { user_id: getUserId(emails[2]), role_id: getRoleId("Patient") },
      { user_id: getUserId(emails[3]), role_id: getRoleId("Patient") },
    ]);

    // 3. Profiles
    await queryInterface.bulkInsert("professionals", [
      {
        user_id: getUserId(emails[0]),
        full_name: "Dr. Carlos Médico",
        specialty: "Medicina General",
        license_number: "MED-12345",
        bio: "Médico con 10 años de experiencia.",
        phone: "555-1234",
      },
    ]);

    const profIdRow = (
      await queryInterface.sequelize.query(
        `SELECT id FROM professionals WHERE user_id = ${getUserId(emails[0])};`,
      )
    )[0];
    const professional_id = profIdRow[0].id;

    await queryInterface.bulkInsert("receptionists", [
      {
        user_id: getUserId(emails[1]),
        full_name: "Ana López",
        phone: "555-5678",
        assigned_to_professional_id: professional_id,
      },
    ]);

    await queryInterface.bulkInsert("patients", [
      {
        user_id: getUserId(emails[2]),
        full_name: "Juan Pérez",
        date_of_birth: "1990-05-15",
        gender: "male",
        phone: "555-0001",
      },
      {
        user_id: getUserId(emails[3]),
        full_name: "María Gómez",
        date_of_birth: "1992-08-20",
        gender: "female",
        phone: "555-0002",
      },
    ]);

    const patientsResult = (
      await queryInterface.sequelize.query(
        `SELECT id, user_id FROM patients WHERE user_id IN (${getUserId(emails[2])}, ${getUserId(emails[3])});`,
      )
    )[0];
    const patient1_id = patientsResult.find(
      (p) => p.user_id === getUserId(emails[2]),
    ).id;
    const patient2_id = patientsResult.find(
      (p) => p.user_id === getUserId(emails[3]),
    ).id;

    // 4. Services
    await queryInterface.bulkInsert("services", [
      {
        professional_id,
        name: "Consulta General",
        description: "Revisión médica básica",
        price: 500.0,
        duration_minutes: 30,
        is_visible: true,
      },
      {
        professional_id,
        name: "Chequeo Completo",
        description: "Revisión médica exhaustiva",
        price: 1200.0,
        duration_minutes: 60,
        is_visible: true,
      },
    ]);

    const servicesResult = (
      await queryInterface.sequelize.query(
        `SELECT id FROM services WHERE professional_id = ${professional_id};`,
      )
    )[0];
    const service1_id = servicesResult[0].id;
    const service2_id = servicesResult[1].id;

    // 5. Appointments
    const now = new Date();
    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await queryInterface.bulkInsert("appointments", [
      {
        patient_id: patient1_id,
        professional_id,
        service_id: service1_id,
        appointment_date: pastDate,
        status: "completed",
        notes: "Paciente presentó fiebre.",
        created_by: getUserId(emails[1]),
        created_date: new Date(),
        updated_date: new Date(),
      },
      {
        patient_id: patient2_id,
        professional_id,
        service_id: service2_id,
        appointment_date: futureDate,
        status: "pending",
        notes: "Chequeo de rutina.",
        created_by: getUserId(emails[1]),
        created_date: new Date(),
        updated_date: new Date(),
      },
      {
        patient_id: patient1_id,
        professional_id,
        service_id: service1_id,
        appointment_date: futureDate,
        status: "cancelled",
        notes: "Paciente no podrá asistir.",
        created_by: getUserId(emails[2]),
        created_date: new Date(),
        updated_date: new Date(),
      },
    ]);

    const aptResult = (
      await queryInterface.sequelize.query(
        `SELECT id FROM appointments WHERE professional_id = ${professional_id} AND status = 'completed';`,
      )
    )[0];
    const completed_apt_id = aptResult[0].id;

    // 6. Medical Records
    await queryInterface.bulkInsert("medical_records", [
      {
        patient_id: patient1_id,
        professional_id,
        appointment_id: completed_apt_id,
        record_type: "general",
        notes: "Fiebre controlada. Se receta paracetamol.",
        data: JSON.stringify({
          blood_pressure: "120/80",
          weight_kg: 75,
          temperature_c: 38.5,
        }),
        created_date: new Date(),
        updated_date: new Date(),
      },
    ]);

    // 7. Payments
    await queryInterface.bulkInsert("payments", [
      {
        appointment_id: completed_apt_id,
        amount: 500.0,
        payment_method: "card",
        status: "completed",
        payment_date: new Date(),
        created_date: new Date(),
        updated_date: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const emails = [
      "doctor@healty.com",
      "recepcion@healty.com",
      "paciente1@healty.com",
      "paciente2@healty.com",
    ];

    const users = (
      await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE email IN ('${emails.join("','")}');`,
      )
    )[0];
    if (users.length === 0) return;
    const userIds = users.map((u) => u.id);

    const profQuery = await queryInterface.sequelize.query(
      `SELECT id FROM professionals WHERE user_id IN (${userIds.join(",")});`,
    );
    const profIds = profQuery[0].map((p) => p.id);

    if (profIds.length > 0) {
      await queryInterface.sequelize.query(
        `DELETE FROM payments WHERE appointment_id IN (SELECT id FROM appointments WHERE professional_id IN (${profIds.join(",")}));`,
      );
      await queryInterface.sequelize.query(
        `DELETE FROM medical_records WHERE professional_id IN (${profIds.join(",")});`,
      );
      await queryInterface.sequelize.query(
        `DELETE FROM appointments WHERE professional_id IN (${profIds.join(",")});`,
      );
      await queryInterface.sequelize.query(
        `DELETE FROM services WHERE professional_id IN (${profIds.join(",")});`,
      );
    }

    await queryInterface.sequelize.query(
      `DELETE FROM receptionists WHERE user_id IN (${userIds.join(",")});`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM patients WHERE user_id IN (${userIds.join(",")});`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM professionals WHERE user_id IN (${userIds.join(",")});`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM user_roles WHERE user_id IN (${userIds.join(",")});`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM users WHERE id IN (${userIds.join(",")});`,
    );
  },
};
