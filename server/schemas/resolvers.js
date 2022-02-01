const { User, Book } = require("../models");

const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // ========= GET_ME =======

    me: async (parent, args, { user }) => {
      try {

        return User.findById(user._id);
        
      } catch (error) {

        throw new AuthenticationError("You need to be logged in!");
        
      }
    },
  },

  Mutation: {
    // =========== LOGIN_USER =============

    loginUser: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { token, user };
    },

    // =========== ADD_USER =============

    addUser: async (parent, args) => {
      const user = await User.create(args);

      if (!user) {
        throw new AuthenticationError("Please enter valid username, email, and password!");
      }

      const token = signToken(user);

      return { user, token };
    },

    // =========== SAVE_BOOK =============

    saveBook: async (parent, { user }, context) => {

      console.log(user);

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: context } },
          { new: true, runValidators: true }
        );

        return updatedUser;

      } catch (error) {
        throw new AuthenticationError("You need to be logged in!");
      }
    },

    // =========== REMOVE_BOOK =============

    removeBook: async (parent, { user }, { bookId }) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        return updatedUser;
        
      } catch (error) {

      throw new AuthenticationError("You need to be logged in!");
      
      }
    },
  },
};

module.exports = resolvers;
