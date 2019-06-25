const Model = require('./Model');
const {
	TableProfile
} = require('./tables');

class ModelUsers extends Model {
	static getTableName () {
		return TableProfile;
	}

	static findByIds(ids) {
		return Model._query(
			`SELECT * FROM ${TableProfile} WHERE id IN (?)`,
			[ids]
		);
	}
	static findById(id) {
		return Model._queryOne(
			`SELECT * FROM ${TableUsers} WHERE id = ?`,
			[id]
		);
	}
}

module.exports = ModelUsers;
