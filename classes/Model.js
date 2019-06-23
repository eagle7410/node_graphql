const mysql         = require('mysql2');
const db            = require('./db');
const ErrorDatabase = require('./ErrorDatabase');

const dbQuery = (...agrs) => new Promise((ok,bad)=> {
	// TODO: clear
	console.log('db query ', agrs);

	db.query(...agrs,(err, result) => {
		if (err) return bad(err);
		ok(result);
	});
});

class Model {
	static mysqlVersion() {
		return db.version();
	}

	static getDatabaseName() {
		return db.config.connectionConfig.database;
	}

	static validator () {
		return ModelValidate;
	}
	static jsonParse(string, messageErrorAlias) {
		return this.validator()._jsonParse(string, messageErrorAlias);
	}

	static validate (modelMethod, config) {

		let methods = Object.keys(config);

		if (methods.includes('isExists')) {
			methods = methods.filter(method => method !== 'isExists');
			methods.unshift('isExists');
		}

		let vals;

		for (let method  of methods) {
			vals = config[method];

			if (typeof ModelValidate[method] !== 'function') {
				throw new Error(`[Model ${this.name}|${modelMethod}|validate]. Bad validator ${method}`);
			}

			if (!Array.isArray(vals))
				vals = [vals];

			for (let val of vals) this._validateMethod(method, val);
		}
	}

	static _validateMethod(method, val) {
		ModelValidate[method](val);
	}
	/**
	 * Build query string. May be use for debug.
	 *
	 * @param {string} sql Sql string with markers insert
	 * @param {array} params Array data insert
	 * @param {array} agr
	 *
	 * @returns {*}
	 */
	static buildQueryString (sql, params, ...agr) {
		return mysql.format(sql, params, ...agr);
	}

	static getTableName () {
		throw new ErrorDatabase(`No implement method getTableName in ${this.name}`);
	}

	static async save(data, escape = true) {

		let result = await this._query(
			`INSERT IGNORE INTO ${this.getTableName()} SET ?`,
			this.buildTableObject(data, escape)
		);

		data.id = result.insertId;

		return data;
	}

	static buildTableObject(data, escape = true, strict = false) {

		const table = this.getTableName ();

		if (!structure[table])
			throw new ErrorDatabase('Unknown table! ' + table);

		const modelData = {};

		for (const key of structure[table].columns) {
			const value = data[key];

			if (value)
				modelData[key] = escape ? this.escape(value) : value;
			else if (strict)
				return;
		}

		return modelData;
	}

	/**
	 * Get all rows from table
	 * @returns {Promise<*>}
	 */
	static all(table) {
		return this._query(`SELECT * FROM ${table || this.getTableName()}`);
	}

	static  async count(condition = null, params, table) {

		table = table || this.getTableName();

		const result = await this._queryOne(
			`SELECT COUNT(*) as count 
			 FROM ${table}
			 ${condition ? 'WHERE ' + condition : ''}`,
			params || []
		);

		return result ? result.count : 0 ;
	}

	static async _queryOne(sql, params) {
		let result = await this._query(sql, params);

		if (result && result.length) {
			return result[0];
		}

		return null;
	}

	static async _query(sql, params = []) {
		try {

			sql = sql.replace(/(\t)+/g, ' ');

			const result = await dbQuery(sql.replace(/(\n|\r)/g, ''), params);

			return result;

		} catch (e) {
			throw ErrorDatabase.extend(e);
		}

	}

	static escape (...agrs) {
		return db.escape(...agrs);
	}

	static escapeClear(val) {

		val = val.trim();

		if (/^\'(.*)\'$/.test(val)) {
			return val.replace(/^\'(.*)\'$/, '$1');
		}

		return val;
	}

	static removeAll () {
		return this._query(`DELETE FROM ??`, [this.getTableName()]);
	}

	static removeById(id) {
		return this._query(`DELETE FROM ?? WHERE id = ?`, [this.getTableName(), id]);
	}

	static removeByProp(prop, val) {
		return this._query(`DELETE FROM ?? WHERE ?? = ?`, [this.getTableName(), prop, val]);
	}

	/**
	 *
	 * @param id
	 * @param table
	 *
	 * @return {Promise<{isDeleted, isEnabled, domain, data, properties, createdAt}|null>}
	 */
	static getById (id, table = null) {
		return this._queryOne(`SELECT * FROM ?? WHERE id = ? LIMIT 1`, [table || this.getTableName(), id]);
	}

	/**
	 * Get one record by condition.
	 *
	 * @param {string} condition
	 * @param {string} params
	 *
	 * @return {Promise<?object>}
	 *
	 */
	static getOneByCondition(condition, params) {
		return this._queryOne(
			`SELECT * FROM ?? WHERE ${condition} LIMIT 1;`,
			[this.getTableName()].concat(params)
		);
	}

	/**
	 * Get lasted record.
	 * @param {string|null} condition
	 * @returns {Promise<{object}>}
	 */
	static lasted (condition = null) {
		return  this._queryOne(
			`SELECT *
			FROM ${this.getTableName()}
			${condition ? `WHERE ${condition} ` : ''}
			ORDER BY id DESC
			LIMIT 1`
		);
	}

	/**
	 * Insert object data to table.
	 *
	 * @param {object} object
	 * @param {string|*} table
	 *
	 * @return {Promise<number>}
	 */
	static async insert(object, table = null) {
		table = table || this.getTableName();

		let arValues = [];
		let arLabels = [];

		for (let [label, value] of Object.entries(object)) {
			arValues.push(value);
			arLabels.push(label);
		}

		const result = await this._query(
			`INSERT INTO ?? (${arLabels.join(',')}) VALUES (${arValues.map(p => '?').join(',')})`,
			[table, ...arValues]
		);

		return result.insertId;
	}

	static async insertMany(arrValues, arrLabels, table = null) {
		table = table || this.getTableName();

		const result = await this._query(
			`INSERT INTO ?? (${arrLabels.join(',')}) 
			VALUES ${arrValues.map(values => `(${values.join(',')})`).join(',')}`,
			[table]
		);

		return result;
	}

	static async updateById(id, updates) {
		let updateString = [], updateValues = [];

		for(let [prop, val] of Object.entries(updates) ) {
			updateValues.push(val);
			updateString.push(`${prop} = ?`);
		}

		const result = await this._query(
			`UPDATE ?? SET ${updateString.join(',')} WHERE id = ?`,
			[this.getTableName(), ...updateValues,id]
		);

		return result.affectedRows || 0;
	}
}

module.exports = Model;
