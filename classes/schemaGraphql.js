const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLList,
	GraphQLString,
	GraphQLInt
} = require('graphql');

const Model = require('./Model');
const ModelUsers = require('./ModelUsers');

const {
	TableUsers,
	TableProfile
} = require('./tables');

const typeProfile = new GraphQLObjectType({
	name : 'profile',
	description : "User profile",
	fields: {
		name_first: {
			description : "Name user",
			type : GraphQLString,
		},
		name_last : {
			description : "Surname user",
			type : GraphQLString,
		},
	}
});

const typeUser = new GraphQLObjectType({
	name : 'user',
	description : "User",
	fields: {
		id: {
			description : "User id",
			type : GraphQLInt
		},
		login: {
			description : "User login",
			type : GraphQLString,
		},
		pass : {
			description : "User password",
			type : GraphQLString,
		},
		profile : {
			description : "User profile",
			type : typeProfile,
			async resolve (parent, agrs, {dataloaders:{ProfileLoader}}) {
				return await ProfileLoader.load(parent.id);
			}
		}
	}
});

// Construct a schema, using GraphQL schema language
const schema = new GraphQLSchema({
	query: new GraphQLObjectType({
		name: 'Query',
		description : "Query",
		fields: {
			hello: {
				description : "hello word test url",
				type: GraphQLString,
				resolve(p, {id}) {
					return 'world';
				}
			},
			users : {
				description : "Get users list",
				type: GraphQLList(typeUser),
				async resolve() {
					return await ModelUsers.all();
				}
			},
			user : {
				description : "Get user by id",
				type: typeUser,
				args: {
					id : {
						type : GraphQLInt,
					}
				},
				async resolve(p, agrs, {dataloaders:{ProfileLoader}}, info) {
					return await ModelUsers.findById(agrs.id);
				}
			},
		}
	})
});

module.exports = {
	schema,
};
