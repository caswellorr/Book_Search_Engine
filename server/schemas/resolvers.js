const { User, Book } = require("../models");

const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // ========= GET_ME =======

    me: async (parent, args, context) => {
      try {

        // console.log('cucumber')
        // console.log(context.user);

        const user = await User.findById(context.user._id);

        console.log(user);

        return user
        
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

    saveBook: async (parent, { book }, { user }) => {

      console.log('cucumber');
      console.log(user);

      if(user) {

        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: book } },
          { new: true, runValidators: true }
        );

        return updatedUser;

      } 
      else {

        throw new AuthenticationError("You need to be logged in!");
      
      }
    },

    // =========== REMOVE_BOOK =============

    removeBook: async (parent, { bookId }, { user }) => {
 
      if(user) {

        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        return updatedUser;

      } else {

        throw new AuthenticationError("You need to be logged in!");


      }
      
    },
  },
};

module.exports = resolvers;
