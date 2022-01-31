const { User, Book } = require('../models');

const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    
    // ========= GET_ME =======

    me: async () => {
      return User.findOne({ username, _id }).populate('books');
    },
  },

  Mutation: {

    // =========== LOGIN_USER =============

    loginUser: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },

    // =========== ADD_USER =============

    addUser: async (parent, args) => {
      const user = await User.create(args);
      return user;
    },

    // =========== SAVE_BOOK =============

    saveBook: async (parent, { user }) => {

      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { new: true }
      );

      return updatedUser;

    },

    // =========== REMOVE_BOOK =============

    removeBook: async (parent, { user }) => {

      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        {new: true}
      );

      return updatedUser;

    },
  },
};

module.exports = resolvers;
