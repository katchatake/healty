const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authDao = require('./auth.dao');

const login = async (email, password) => {
    const user = await authDao.findByEmail(email);
    if (!user) {
        const error = new Error('Invalid email or password');
        error.status = 401;
        throw error;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        const error = new Error('Invalid email or password');
        error.status = 401;
        throw error;
    }

    const payload = {
        id: user.id,
        email: user.email,
        roles: user.roles.map(r => r.name)
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    // Remove password from response
    delete user.password;

    return {
        user,
        token
    };
};

module.exports = {
    login
};
