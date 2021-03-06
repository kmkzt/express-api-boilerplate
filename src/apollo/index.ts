import * as fs from 'fs'
import { join } from 'path'
import { ApolloServer, gql, IResolvers } from 'apollo-server-express'
import { Resolvers, QueryResolvers, MutationResolvers } from '../graphql/schema'
import { User } from '../entity/user'
import { add as addUserQuery, update as updateUserQuery } from '../model/user'

// docs
// https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express#express

// Construct a schema, using GraphQL schema language
const gqlSchema: string = fs
  .readFileSync(join(__dirname, '../graphql/schema.graphql'))
  .toString()

// Provide resolver functions for your schema fields
const Query: QueryResolvers = {
  async getUser(_parent, args, _context, _info) {
    try {
      const user = await User.findOne({ id: args.id as string })
      if (!user) {
        return null
      }
      return user
    } catch (err) {
      throw err
    }
  },
  async getUsers(_parent, args, _context, _info) {
    try {
      const users = await User.find()
      return users
    } catch (err) {
      throw err
    }
  }
}

const Mutation: MutationResolvers = {
  async addUser(_parent, args, _context, _info) {
    try {
      const result = await addUserQuery(args.user)
      return result
    } catch (err) {
      throw err
    }
  },
  async updateUser(_parent, args, _context, _info) {
    try {
      const updateResult = await updateUserQuery(args.user)
      return updateResult
    } catch (err) {
      throw err
    }
  },
  async deleteUser(_parent, args, _context, _info) {
    try {
      console.log(_parent, args, _context, _info)
      return '2'
    } catch (err) {
      throw err
    }
  }
}

const apolloServer = new ApolloServer({
  typeDefs: gql`
    ${gqlSchema}
  `,
  resolvers: {
    Query,
    Mutation
  } as IResolvers,
  // rootValue: (documentNode) => {
  //   const op = getOperationAST(documentNode)
  //   return op === 'mutation' ? mutationRoot : queryRoot;
  // },
  context: ctx => ({
    // authScope: getScope(req.headers.authorization)  // authorization config
  }),
  playground: true
})

export default apolloServer
