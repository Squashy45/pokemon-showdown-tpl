// TPL's six-player client is served separately from the public PS client.
Config.testclient = true;
Config.defaultserver = {
	id: 'tpl',
	protocol: 'http',
	host: '144.126.207.98',
	port: 8000,
	httpport: 8000,
	altport: 8000,
	registered: true,
};
Config.server = Config.defaultserver;
