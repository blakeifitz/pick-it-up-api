const AuthService = require('../auth/auth-service');

const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UserService = {
  hasUserWithUserName(db, username) {
    return db('users')
      .where({ username })
      .first()
      .then((user) => !!user);
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([user]) => user);
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password must be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password must be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character';
    }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeUser(user) {
    const sub = user.username;
    const payload = {
      user_id: user.id,
      username: user.username,
    };
    return {
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      authToken: AuthService.createJwt(sub, payload),
    };
  },
};

module.exports = UserService;
