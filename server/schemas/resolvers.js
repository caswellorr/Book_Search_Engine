const { User, Book } = require("../models");

const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // ========= GET_ME =======

    me: async (parent, args, { user }) => {
      return User.findById(user._id).populate("books");
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
        console.log("Something is wrong!");
      }

      const token = signToken(user);

      return { user, token };
    },

    // =========== SAVE_BOOK =============

    saveBook: async (parent, { user }, context) => {

      console.log({ user });

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: context } },
          { new: true, runValidators: true }
        );

        return updatedUser;

      } catch (error) {
        console.log(error);
      }
    },

    // =========== REMOVE_BOOK =============

    removeBook: async (parent, { user }, context) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $pull: { savedBooks: { bookId: params.bookId } } },
          { new: true }
        );

        return updatedUser;
        
      } catch (error) {
        if (!updatedUser) {
          console.log("Couldn't find user with this id!");
          console.log(error);
        }
      }
    },
  },
};

module.exports = resolvers;
