const Dataloader   = require('dataloader');
const ModelProfile = require('./ModelProfile');

const ProfileLoader = new Dataloader(async (ids) => {
	const profiles = await ModelProfile.findByIds(ids);
	let profileObject = {};

	profiles.map(p => {
		profileObject[p.id] = p;
	});

	return ids.map(id => {
		return profileObject[id] || null;
	})
});


module.exports = {
	ProfileLoader
}
