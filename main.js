const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
import('node-fetch')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async getSatellite() {
		this.log('debug', 'fetch')
		try {
			const response = await fetch(this.url, { signal: AbortSignal.timeout(this.config.timeout) })
			const json = await response.json()
			this.updateStatus(InstanceStatus.Ok)
			if (json.host) {
				this.setVariableValues({ host: json.host })
			}
			if (json.port) {
				this.setVariableValues({ port: json.port })
			}
			if (json.connected) {
				this.setVariableValues({ con: json.connected })
			}
		} catch (error) {
			this.log('error', error)
			this.updateStatus(InstanceStatus.Disconnected)
		}
	}

	async init(config) {
		this.config = config

		this.url = 'http://' + this.config.host + ':' + String(this.config.port) + '/api/config'

		this.updateStatus(InstanceStatus.Connecting)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions

		this.getSatellite()

		this.interval = setInterval(() => {
			this.getSatellite()
		}, parseInt(this.config.timeout) + 500)
	}
	// When module gets deleted
	async destroy() {
		clearInterval(this.interval)
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
		clearInterval(this.interval)

		this.getSatellite()
		this.interval = setInterval(() => {
			this.getSatellite()
		}, parseInt(this.config.timeout) + 500)
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Satellite IP',
				width: 8,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'REST Port',
				width: 4,
				regex: Regex.PORT,
			},
			{
				label: 'Timeout (ms)',
				type: 'number',
				id: 'timeout',
				width: 4,
				min: 500,
				max: 20000,
				default: 10000,
			},
		]
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
