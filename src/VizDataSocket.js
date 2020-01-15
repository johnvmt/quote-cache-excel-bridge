
class VizDataSocket {

	constructor() {

	}


	sendVariable(key, value) {
		const commandStr = (this._options.commandInterface) ?
			`send VIZ_COMMUNICATION*MAP SET_STRING_ELEMENT "${key}" ${value}\0` :
			`${key}|${value}\0`;

		if(this.socket.destroyed)
			throw new Error(`Socket is closed`);
		this.socket.write(commandStr);
	}

}