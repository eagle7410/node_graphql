const db = require('./db');
const graphqlHTTP = require('express-graphql');
const bodyParser = require('body-parser');
const ServerFrame = require('./ServerFrame');
const dataloaders = require('./dataloaders');

const {
	TableProfile,
	TableUsers,
} = require('./tables');
const {root, schema} = require('./schemaGraphql');

class Server extends ServerFrame{
	async up () {
		await this.upDb();

		this._app.use(bodyParser.json());

		this._app.use((req, res, next) => {
			// TODO: clear
			console.log('req url ', req.url, JSON.stringify(req.body));
			next();
		});
		this._app.get('/ping', (req, res) => {
			res.status(200)
				.json({message : 'pong'});
		});

		this._app.use('/graphql', graphqlHTTP({
			schema,
			graphiql: true,
			context: {
				dataloaders,
				user: {
					name : 'TEST',
					surname : 'Anonymous'
				},
			}
		}));

		await super.up();
	}

	timeout (ms) {
		return setTimeout(() => new Promise((ok) => {
			ok();
		}), ms)
	}
	async upDb () {
		const reconnectLimit = 5000;
		let reconnectCount = 0;
		let isConnected = false;

		while (!isConnected && reconnectCount > reconnectLimit)  {
			isConnected = await db.connect().catch(console.error);
			reconnectCount++;
			console.log(`Wait init db. Count ${reconnectCount} of ${reconnectLimit}`);
			await this.timeout(500);
		}

		console.log('Db connect is ok');

		const Model = require('./Model');

		await Model._query(`CREATE DATABASE IF NOT EXISTS ${db.dbName()};`);

		console.log(`Check database ${db.dbName()}`);

		await db.changeConnect({database: db.dbName()});

		await Model._query(
			'CREATE TABLE IF NOT EXISTS `'+TableUsers+'` (' +
				'  `id` int(11) NOT NULL auto_increment,' +
				'  `login` varchar(50) NOT NULL ,' +
				'  `pass`  varchar(50) NOT NULL ,' +
				'   PRIMARY KEY  (`id`)' +
			');'
		);

		await Model._query(
			'CREATE TABLE IF NOT EXISTS `'+TableProfile+'` (' +
			'  `id` int(11) NOT NULL auto_increment,' +
			'  `name_first` varchar(50) NOT NULL ,' +
			'  `name_last`  varchar(50) NOT NULL ,' +
			'  `phone`  varchar(50) DEFAULT NULL ,' +
			'   PRIMARY KEY  (`id`)' +
			');'
		);

		console.log(`Check tables ok `);

		if (await Model.count(null, {}, TableUsers) < 1) {
			await Model._query(
				'INSERT INTO ' + TableUsers + '(id, login, pass) ' +
				" VALUES (1, 'U1', 'P1'), (2, 'U2', 'P2')"
			);
		}

		if (await Model.count(null, {}, TableProfile) < 1) {
			await Model._query(
				'INSERT INTO ' + TableProfile + '(id, name_first, name_last, phone) ' +
				" VALUES (1, 'n1', 's1', '25-25-25'), (2, 'n2', 's2', null)"
			);
		}

		console.log(`Test data ok `);

		this._app.get('/users', async (req, res) => {

			const users = await Model.all(TableUsers);

			res.status(200).json({users})
		});
	}
}

module.exports = Server;
