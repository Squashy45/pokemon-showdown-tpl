// TPL's six-player client is served separately from the public PS client.
Config.testclient = true;
Config.defaultserver = {
	id: 'tpl',
	host: '144-126-207-98.insecure.psim.us',
	port: 443,
	httpport: 80,
	altport: 80,
	registered: true,
};
Config.server = Config.defaultserver;
