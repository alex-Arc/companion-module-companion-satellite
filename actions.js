import('node-fetch')

module.exports = function (self) {
	self.setActionDefinitions({
		set_host: {
			name: 'Set Host',
			options: [
				{
					id: 'host',
					type: 'textinput',
					label: 'Host IP',
					default: '127.0.0.1',
				},
				{
					id: 'port',
					type: 'number',
					label: 'Satellite Port',
					default: 16622,
				},
			],
			callback: async (event) => {
				// console.log('debug', 'set host ' + event.options.host)
				self.log('debug', 'set host ' + JSON.stringify({ host: event.options.host, port: event.options.port }))
				try {
					await fetch(self.url, {
						// signal: AbortSignal.timeout(self.config.timeout),
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ host: event.options.host, port: event.options.port }),
					})
				} catch (error) {
					self.log('error', 'post' + JSON.stringify({ host: event.options.host, port: event.options.port }))
				}
			},
		},
	})
}
