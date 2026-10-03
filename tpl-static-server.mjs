import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve('play.pokemonshowdown.com');
const port = Number(process.env.PORT || process.argv[2] || 8081);
const types = {
	'.css': 'text/css; charset=utf-8',
	'.gif': 'image/gif',
	'.html': 'text/html; charset=utf-8',
	'.ico': 'image/x-icon',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp',
};

createServer((request, response) => {
	const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
	let file = resolve(root, `.${pathname}`);
	if (file !== root && !file.startsWith(root + sep)) {
		response.writeHead(403).end('Forbidden');
		return;
	}
	if (!existsSync(file) || statSync(file).isDirectory()) {
		if (extname(pathname)) {
			response.writeHead(404).end('Not found');
			return;
		}
		file = resolve(root, 'index-new.html');
	}
	response.setHeader('Cache-Control', 'no-cache');
	response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
	createReadStream(file).on('error', () => response.writeHead(500).end('Read error')).pipe(response);
}).listen(port, '0.0.0.0', () => {
	console.log(`TPL client listening on http://0.0.0.0:${port}`);
});
