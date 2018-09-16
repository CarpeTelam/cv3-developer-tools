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
		const deletedFiles = response.map((path) => `${path.replace(process.cwd(), '.')}`);
		console.log(`Deleted the following files: ${JSON.stringify(deletedFiles, null, 2)}`);
	} else {
		console.log('Nothing to delete');
	}

})();
