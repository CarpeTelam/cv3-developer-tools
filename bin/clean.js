const del = require('del');

(async () => {
	const paths = [
		'./extract/store/*.zip',
		'./extract/bootstrap/bootstrap/',
		'./extract/bootstrap/*.zip',
		'**/.DS_Store'
	];
	const response = await del(paths);
	if (response.length > 0) {
		console.log('Deleted the following files:');
		console.log(response.map((path) => `${path.replace(process.cwd(), '.')}`).join('\n'));
	} else {
		console.log('Nothing to delete.');
	}
})();
