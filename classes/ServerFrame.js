const http    = require('http');
const express = require('express');

class ServerFrame {
	/**
	 *
	 * @param {number} port
	 * @param {string} tz
	 * @param {number} version
	 */
	constructor (port, tz = 'Europe/London', version = 1) {

		process.env.TZ = tz;

		/**
		 *
		 * @type {string}
		 *
		 * @protected
		 */
		this._tz = tz;

		this.port        = port;
		/**
		 *
		 * @type {createApplication}
		 * @protected
		 */
		this._express    = express;
		/**
		 *
		 * @type {object}
		 * @protected
		 */
		this._app        = express();
		/**
		 *
		 * @type {number}
		 * @protected
		 */
		this._version    = String(version || 1);
		/**
		 *
		 * @type {object}
		 * @protected
		 */
		this._server     = http.Server(this._app);
		/**
		 *
		 * @type {string}
		 * @protected
		 */
		this._serverName = `ServerFrameV${this._version}`;
	}

	async up () {

		this._server.listen(this.port, async () => {
			const baseLine = `=== ${this._serverName} APP READY IN PORT ${this.port} ===\n`;
			const len = baseLine.length - 1;

			console.log(
				`\n\n ${'='.repeat(len)}\n ${baseLine} ${'='.repeat(len)}\n`,
				`link in browser http://localhost:${this.port}\n\n`,
			);
		});
	}

	down () {
		return new Promise( closed => {
			this._server.close(() => closed());
		});
	}
}

module.exports = ServerFrame;
