var DataTypes = require("sequelize").DataTypes;
var _SequelizeMeta = require("./SequelizeMeta");
var _appointments = require("./appointments");
var _expenses = require("./expenses");
var _medical_records = require("./medical_records");
var _patients = require("./patients");
var _payments = require("./payments");
var _professionals = require("./professionals");
var _receptionists = require("./receptionists");
var _roles = require("./roles");
var _services = require("./services");
var _sessions = require("./sessions");
var _user_roles = require("./user_roles");
var _users = require("./users");

function initModels(sequelize) {
  var SequelizeMeta = _SequelizeMeta(sequelize, DataTypes);
  var appointments = _appointments(sequelize, DataTypes);
  var expenses = _expenses(sequelize, DataTypes);
  var medical_records = _medical_records(sequelize, DataTypes);
  var patients = _patients(sequelize, DataTypes);
  var payments = _payments(sequelize, DataTypes);
  var professionals = _professionals(sequelize, DataTypes);
  var receptionists = _receptionists(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var services = _services(sequelize, DataTypes);
  var sessions = _sessions(sequelize, DataTypes);
  var user_roles = _user_roles(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  roles.belongsToMany(users, { as: 'user_id_users', through: user_roles, foreignKey: "role_id", otherKey: "user_id" });
  users.belongsToMany(roles, { as: 'role_id_roles', through: user_roles, foreignKey: "user_id", otherKey: "role_id" });
  medical_records.belongsTo(appointments, { as: "appointment", foreignKey: "appointment_id"});
  appointments.hasMany(medical_records, { as: "medical_records", foreignKey: "appointment_id"});
  payments.belongsTo(appointments, { as: "appointment", foreignKey: "appointment_id"});
  appointments.hasMany(payments, { as: "payments", foreignKey: "appointment_id"});
  appointments.belongsTo(patients, { as: "patient", foreignKey: "patient_id"});
  patients.hasMany(appointments, { as: "appointments", foreignKey: "patient_id"});
  medical_records.belongsTo(patients, { as: "patient", foreignKey: "patient_id"});
  patients.hasMany(medical_records, { as: "medical_records", foreignKey: "patient_id"});
  appointments.belongsTo(professionals, { as: "professional", foreignKey: "professional_id"});
  professionals.hasMany(appointments, { as: "appointments", foreignKey: "professional_id"});
  expenses.belongsTo(professionals, { as: "professional", foreignKey: "professional_id"});
  professionals.hasMany(expenses, { as: "expenses", foreignKey: "professional_id"});
  medical_records.belongsTo(professionals, { as: "professional", foreignKey: "professional_id"});
  professionals.hasMany(medical_records, { as: "medical_records", foreignKey: "professional_id"});
  receptionists.belongsTo(professionals, { as: "assigned_to_professional", foreignKey: "assigned_to_professional_id"});
  professionals.hasMany(receptionists, { as: "receptionists", foreignKey: "assigned_to_professional_id"});
  services.belongsTo(professionals, { as: "professional", foreignKey: "professional_id"});
  professionals.hasMany(services, { as: "services", foreignKey: "professional_id"});
  user_roles.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(user_roles, { as: "user_roles", foreignKey: "role_id"});
  appointments.belongsTo(services, { as: "service", foreignKey: "service_id"});
  services.hasMany(appointments, { as: "appointments", foreignKey: "service_id"});
  appointments.belongsTo(users, { as: "created_by_user", foreignKey: "created_by"});
  users.hasMany(appointments, { as: "appointments", foreignKey: "created_by"});
  patients.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasOne(patients, { as: "patient", foreignKey: "user_id"});
  professionals.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasOne(professionals, { as: "professional", foreignKey: "user_id"});
  receptionists.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasOne(receptionists, { as: "receptionist", foreignKey: "user_id"});
  sessions.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(sessions, { as: "sessions", foreignKey: "user_id"});
  user_roles.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(user_roles, { as: "user_roles", foreignKey: "user_id"});

  return {
    SequelizeMeta,
    appointments,
    expenses,
    medical_records,
    patients,
    payments,
    professionals,
    receptionists,
    roles,
    services,
    sessions,
    user_roles,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
