const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLList,
	GraphQLString,
	GraphQLInt
} = require('graphql');

const Model = require('./Model');
const {
	TableUsers,
	TableProfile
} = require('./tables');

const typeProfile = new GraphQLObjectType({
	name : 'profile',
	description : "User profile",
	fields: {
		name_first: {
			type : GraphQLString,
		},
		name_last : {
			type : GraphQLString,
		},
	}
});

const typeUser = new GraphQLObjectType({
	name : 'user',
	description : "User",
	fields: {
		id: {
			type : GraphQLInt
		},
		login: {
			type : GraphQLString,
		},
		pass : {
			type : GraphQLString,
		},
		profile : {
			type : typeProfile,
			async resolve (parent) {
				return await Model._queryOne(
					`SELECT * FROM ${TableProfile} WHERE id = ?`,
					[parent.id]
				);
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
					return await Model._query(
						`SELECT * FROM ${TableUsers}`,
					);
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
				async resolve(p, {id}) {
					return await Model._queryOne(
						`SELECT * FROM ${TableUsers} WHERE id = ?`,
						[id]
					);
				}
			},
		}
	})
});

module.exports = {
	schema,
};
