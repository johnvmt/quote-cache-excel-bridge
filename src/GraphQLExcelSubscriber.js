import createGraphQLClient from "graphql-http-ws-client";
import WebSocket from "ws";
import XLSX from "xlsx";
import CacheItemSubscriptionController from "./CacheItemSubscriptionController"

class GraphQLExcelSubscriber {
	constructor(config, options) {
		const self = this;

		self._options = options;
		self._config = config;
		self._cacheItemSubscriptionControllers = new Set();

		const {client, subscriptionClient} = createGraphQLClient(self._config.serverURL, {
			websocket: WebSocket,
			createWebsocketLink: true,
			createHTTPLink: false
		});

		subscriptionClient.onConnected(() => {
			self.debug("Connected to", self._config.serverURL);
		});

		subscriptionClient.onReconnected(() => {
			self.debug("Reconnected to", self._config.serverURL);
		});

		subscriptionClient.onDisconnected(() => {
			self.debug("Disconnected from", self._config.serverURL);
		});

		for(let subscriptionParams of self._config.subscriptions) {
			const cacheItemSubscriptionController = new CacheItemSubscriptionController(client, subscriptionParams, self._options);

			cacheItemSubscriptionController.on('data', (data) => {
				self.debug("Received data", subscriptionParams.variable, data);
				self.outputWorkbookSafe();
			});

			self._cacheItemSubscriptionControllers.add(cacheItemSubscriptionController);
		}
	}

	outputWorkbookSafe() {
		const self = this;

		if(self._config.hasOwnProperty('outputDebounce') && typeof self._config.outputDebounce === 'number') {
			if(!this.hasOwnProperty('_lastOutput') || (new Date() - self._lastOutput) > self._config.outputDebounce)
				this.outputWorkbook();
			else if(!self.hasOwnProperty('_outputTimeout')) {
				self._outputTimeout = setTimeout(() => {
					self.outputWorkbook();
				}, self._config.outputDebounce)
			}
		}
		else
			self.outputWorkbook();
	}

	outputWorkbook() {
		this._lastOutput = new Date();
		const xlsWorkbook = XLSX.utils.book_new();
		const xlsWorksheetName = (typeof this._config.outputWorksheet === 'string') ? this._config.outputWorksheet : "Sheet 1";
		const xlsWorksheetData = [];

		for(let cacheItemSubscriptionController of this._cacheItemSubscriptionControllers) {
			xlsWorksheetData.push([cacheItemSubscriptionController.subscriptionParams.variable, cacheItemSubscriptionController.data]);
		}

		const xlsWorksheet = XLSX.utils.aoa_to_sheet(xlsWorksheetData);
		XLSX.utils.book_append_sheet(xlsWorkbook, xlsWorksheet, xlsWorksheetName);

		XLSX.writeFile(xlsWorkbook, this._config.outputWorkbook);

		this.debug("Outputting workbook", this._config.outputWorkbook);
	}

	debug() {
		if(typeof this._options.debug === "function")
			this._options.debug.apply(this, Array.prototype.slice.call(arguments));
		else if(this._options.debug)
			console.log.apply(console, Array.prototype.slice.call(arguments));
	}
}

export default GraphQLExcelSubscriber;

