var mysql = require('mysql2');


const {
	db,
	host,
	user,
	password
} = process.env;

var con = mysql.createConnection({
	host,
	user,
	password,
});

con.dbName = () => db;

con.changeConnect= (opt) => new Promise((ok, bad) => {
	con.changeUser(opt, (err)=> {
		if (err) return bad(err);
		ok(true);
	})
});


con.connect((err) =>  new Promise((ok, bad) => {
	if (err) throw bad(err);
	ok(true);
}));

module.exports =  con;
