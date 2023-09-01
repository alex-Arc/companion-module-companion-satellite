module.exports = async function (self) {
	self.setVariableDefinitions([
		{ variableId: 'con', name: 'Connected' },
		{ variableId: 'host', name: 'Host' },
		{ variableId: 'port', name: 'Port' },
	])
}
