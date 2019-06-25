const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLList,
	GraphQLString,
	GraphQLInt,
	GraphQLNonNull,
} = require('graphql');

const ModelUsers = require('./ModelUsers');
const ModelProfile = require('./ModelProfile');

const Str = GraphQLNonNull(GraphQLString);
const StrNull = GraphQLString;
const Int = GraphQLNonNull(GraphQLInt);
const IntNull = GraphQLInt;
const List = GraphQLList;

const typeProfile = new GraphQLObjectType({
	name : 'profile',
	description : "User profile",
	fields: {
		name_first: {
			description : "Name user",
			type : StrNull,
		},
		name_last : {
			description : "Surname user",
			type : StrNull,
		},
		phone : {
			description : "Surname user",
			type : StrNull,
		},
	}
});

const typeUser = new GraphQLObjectType({
	name : 'user',
	description : "User",
	fields: {
		id: {
			description : "User id",
			type : Int
		},
		login: {
			description : "User login",
			type : Str
		},
		pass : {
			description : "User password",
			type : GraphQLNonNull(GraphQLString),
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
				type: Str,
				resolve(p, {id}) {
					return 'world';
				}
			},
			users : {
				description : "Get users list",
				type: List(typeUser),
				async resolve() {
					return await ModelUsers.all();
				}
			},
			user : {
				description : "Get user by id",
				type: typeUser,
				args: {
					id : {
						type : Int,
					}
				},
				async resolve(p, agrs, {dataloaders:{ProfileLoader}}, info) {
					return await ModelUsers.findById(agrs.id);
				}
			},
		}
	}),
	mutation : new GraphQLObjectType({
		name: 'Mutation',
		description : "Changes",
		fields : {
			profileUpdateById : {
				description : "Update user by id",
				type: typeProfile,
				args: {
					id : {
						type : Int,
					},
					name : {
						type : Str
					},
					lastname : {
						type : Str
					}

				},
				async resolve(p, {id, name, lastname}, {dataloaders:{ProfileLoader}}, info) {
					ProfileLoader.clear(id);

					await ModelProfile.updateById(id, {
						name_first: name,
						name_last : lastname
					});

					return ProfileLoader.load(id)
				}
			},
		}

	})
});

module.exports = {
	schema,
};
