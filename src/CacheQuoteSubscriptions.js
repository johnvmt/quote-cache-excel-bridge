import createGraphQLClient from "graphql-http-ws-client";
import WebSocket from "ws";
import EventEmitter from "wolfy87-eventemitter";
import CacheItemSubscriptionController from "./CacheItemSubscriptionController"

class CacheQuoteSubscriptions extends EventEmitter {
	constructor(serverURL, subscriptionsParams, options) {
		super();
		const self = this;

		self._options = options;
		self._subscriptions = new Set();

		const {client, subscriptionClient} = createGraphQLClient(serverURL, {
			websocket: WebSocket,
			createWebsocketLink: true,
			createHTTPLink: false
		});

		subscriptionClient.onConnected(() => {
			self.emit('connected');
			self.debug("Connected to", serverURL);
		});

		subscriptionClient.onReconnected(() => {
			self.emit('reconnected');
			self.debug("Reconnected to", serverURL);
		});

		subscriptionClient.onDisconnected(() => {
			self.emit('disconnected');
			self.debug("Disconnected from", serverURL);
		});

		for(let subscriptionParams of subscriptionsParams) {
			const cacheItemSubscriptionController = new CacheItemSubscriptionController(client, subscriptionParams, self._options);
			const subscription = {
				subscriptionParams: subscriptionParams,
				cacheItemSubscriptionController: cacheItemSubscriptionController
			};

			self._subscriptions.add(subscription);

			cacheItemSubscriptionController.on('data', (data) => {
				self.debug(`Received data ${subscriptionParams.collectionID}/${subscriptionParams.itemID}/${subscriptionParams.fieldID}: ${data}`);
				self.emit('data', CacheQuoteSubscriptions.subscriptionValue(subscription));
			});
		}
	}

	get values() {
		let values = [];

		for(let subscription of this._subscriptions) {
			values.push(CacheQuoteSubscriptions.subscriptionValue(subscription));
		}

		return values;
	}

	debug() {
		if(typeof this._options.debug === "function")
			this._options.debug.apply(this, Array.prototype.slice.call(arguments));
		else if(this._options.debug)
			console.log.apply(console, Array.prototype.slice.call(arguments));
	}

	static subscriptionValue(subscription) {
		return Object.assign({}, subscription.subscriptionParams, {value: subscription.cacheItemSubscriptionController.data});
	}
}

export default CacheQuoteSubscriptions;
