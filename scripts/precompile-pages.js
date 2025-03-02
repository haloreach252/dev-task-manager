const axios = require('axios');

const pages = [
	'/',
	'/about',
	'/contact',
	'/changelog',
	'/privacy-policy',
	'/teams',
	'/projects',
	'/auth',
];

async function precompilePages() {
	for (const page of pages) {
		try {
			await axios.get(`http://localhost:3000${page}`);
			console.log(`Precompiled ${page}`);
		} catch (error) {
			console.error(`Error precompiling ${page}:`, error.message);
		}
	}
}

precompilePages();
