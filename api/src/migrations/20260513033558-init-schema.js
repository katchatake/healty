'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. roles
    await queryInterface.createTable('roles', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(50), unique: true, allowNull: false },
      description: { type: Sequelize.TEXT },
      created_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 2. users
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING(150), unique: true, allowNull: false },
      password: { type: Sequelize.STRING(255), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    // user_roles (pivot)
    await queryInterface.createTable('user_roles', {
      user_id: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      role_id: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'roles', key: 'id' }, onDelete: 'CASCADE' }
    });

    // 3. sessions
    await queryInterface.createTable('sessions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      token: { type: Sequelize.TEXT, allowNull: false },
      device_info: { type: Sequelize.STRING(255) },
      ip_address: { type: Sequelize.STRING(45) },
      is_valid: { type: Sequelize.BOOLEAN, defaultValue: true },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      created_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 4. professionals
    await queryInterface.createTable('professionals', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, unique: true, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      full_name: { type: Sequelize.STRING(200), allowNull: false },
      specialty: { type: Sequelize.STRING(100), allowNull: false },
      license_number: { type: Sequelize.STRING(50), unique: true },
      bio: { type: Sequelize.TEXT },
      phone: { type: Sequelize.STRING(20) }
    });

    // 5. receptionists
    await queryInterface.createTable('receptionists', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, unique: true, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      full_name: { type: Sequelize.STRING(200), allowNull: false },
      phone: { type: Sequelize.STRING(20) },
      assigned_to_professional_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'professionals', key: 'id' }, onDelete: 'SET NULL' }
    });

    // 6. patients
    await queryInterface.createTable('patients', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, unique: true, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      full_name: { type: Sequelize.STRING(200), allowNull: false },
      date_of_birth: { type: Sequelize.DATEONLY },
      gender: { type: Sequelize.STRING(20) },
      phone: { type: Sequelize.STRING(20) },
      emergency_contact: { type: Sequelize.STRING(100) }
    });

    // 7. services
    await queryInterface.createTable('services', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      professional_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'professionals', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(150), allowNull: false },
      description: { type: Sequelize.TEXT },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      duration_minutes: { type: Sequelize.INTEGER, allowNull: false },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: true }
    });

    // 8. appointments
    await queryInterface.createTable('appointments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      patient_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'patients', key: 'id' } },
      professional_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'professionals', key: 'id' } },
      service_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'services', key: 'id' } },
      appointment_date: { type: Sequelize.DATE, allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'confirmed', 'completed', 'cancelled'), defaultValue: 'pending' },
      notes: { type: Sequelize.TEXT },
      created_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
      created_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    // 9. medical_records
    await queryInterface.createTable('medical_records', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      patient_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'patients', key: 'id' } },
      professional_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'professionals', key: 'id' } },
      appointment_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'appointments', key: 'id' }, onDelete: 'SET NULL' },
      record_type: { type: Sequelize.STRING(50), allowNull: false },
      notes: { type: Sequelize.TEXT },
      data: { type: Sequelize.JSON },
      created_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    // 10. payments
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      appointment_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'appointments', key: 'id' }, onDelete: 'CASCADE' },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      payment_method: { type: Sequelize.ENUM('cash', 'card', 'transfer'), allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'), defaultValue: 'pending' },
      payment_date: { type: Sequelize.DATE },
      created_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    // 11. expenses
    await queryInterface.createTable('expenses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      professional_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'professionals', key: 'id' } },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      category: { type: Sequelize.ENUM('rent', 'supplies', 'salary', 'services', 'other'), defaultValue: 'other' },
      expense_date: { type: Sequelize.DATEONLY, allowNull: false },
      created_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('expenses');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('medical_records');
    await queryInterface.dropTable('appointments');
    await queryInterface.dropTable('services');
    await queryInterface.dropTable('patients');
    await queryInterface.dropTable('receptionists');
    await queryInterface.dropTable('professionals');
    await queryInterface.dropTable('sessions');
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('roles');
  }
};
