'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Insert Roles
    await queryInterface.bulkInsert('roles', [
      { name: 'Admin', description: 'Administrador total del sistema, gestiona usuarios y clínicas', created_date: new Date() },
      { name: 'Professional', description: 'Especialista de salud (Nutricionista, Psicólogo, etc.) que ofrece servicios', created_date: new Date() },
      { name: 'Receptionist', description: 'Personal de apoyo que gestiona agendas de los profesionales', created_date: new Date() },
      { name: 'Patient', description: 'Usuario final que busca servicios y agenda citas', created_date: new Date() },
      { name: 'Root', description: 'Super Usuario con acceso total al sistema', created_date: new Date() }
    ], {});

    // 2. Insert Root User
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await queryInterface.bulkInsert('users', [{
      email: 'root@system.com',
      password: hashedPassword,
      is_active: true,
      created_date: new Date(),
      updated_date: new Date()
    }], {});

    // 3. Link Root User with Root Role
    const users = await queryInterface.sequelize.query(
      `SELECT id from users WHERE email='root@system.com';`
    );
    const userRows = users[0];

    const roles = await queryInterface.sequelize.query(
      `SELECT id from roles WHERE name='Root';`
    );
    const roleRows = roles[0];

    if(userRows.length > 0 && roleRows.length > 0) {
      await queryInterface.bulkInsert('user_roles', [{
        user_id: userRows[0].id,
        role_id: roleRows[0].id
      }], {});
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('users', { email: 'root@system.com' }, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};
