const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require("../../logger");
const User = require('../../models/user');

module.exports = {
  createUser: async args => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error('User exists already.');
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      });

      const result = await user.save();

      return { ...result._doc, password: null, _id: result.id };
    } catch (err) {
      logger.error("Error",err);
      throw err;
    }
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email });
    if (!user) {
      logger.error(`User does not exist!${user}`);
      throw new Error('User does not exist!');
    }
    logger.info(`User successful!${email}`);
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Password is incorrect!');
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'somesupersecretkey',
      {
        expiresIn: '1h'
      }
    );
    return { userId: user.id, token: token, email:  user.email, tokenExpiration: 1 };
  }
};
