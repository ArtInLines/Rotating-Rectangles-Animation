export default class EventEmitter {
	constructor({ ignoreMissingEvents = false }) {
		this._events = {};
		this._options = {
			ignoreMissingEvents: ignoreMissingEvents,
		};
	}

	get events() {
		return Object.keys(this._events);
	}

	on(event, ...listeners) {
		if (!this._events[event]) this._events[event] = listeners;
		else this._events[event].push(...listeners);
		return this;
	}

	emit(event, ...data) {
		if (!this._events[event]) {
			if (this._options.ignoreMissingEvents) return this;
			else throw new Error(`Can't emit a non-existent event: "${event}"`);
		}

		this._events[event].forEach((listener) => listener(...data));
		return this;
	}

	rmListener(event, listenerToRemove) {
		if (!this._events[event]) {
			if (this._options.ignoreMissingEvents) return this;
			else throw new Error(`Can't remove a listener on a non-existent event: "${event}"`);
		}

		this._events[event] = this._events[event].filter((listener) => listener !== listenerToRemove);
		return this;
	}

	rmAllListeners(...events) {
		events.forEach((event) => {
			this._events[event] = [];
		});
		return this;
	}
}
