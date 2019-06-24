const Model = require('./Model');
const {
	TableUsers
} = require('./tables');

class ModelUsers extends Model {
	static getTableName () {
		return TableUsers;
	}

	static findById(id) {
		return Model._queryOne(
			`SELECT * FROM ${TableUsers} WHERE id = ?`,
			[id]
		);
	}
}

module.exports = ModelUsers;
