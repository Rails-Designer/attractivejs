// attractivejs@1.0.0 downloaded from https://unpkg.com/attractivejs@1.0.0-alpha.4/dist/attractive.js

//#region src/core/hooks.js
var Hooks = class {
	#before = /* @__PURE__ */ new Set();
	#after = /* @__PURE__ */ new Set();
	#error = /* @__PURE__ */ new Set();
	addBefore(callback) {
		this.#before.add(callback);
		return this;
	}
	addAfter(callback) {
		this.#after.add(callback);
		return this;
	}
	addError(callback) {
		this.#error.add(callback);
		return this;
	}
	removeBefore(callback) {
		this.#before.delete(callback);
		return this;
	}
	removeAfter(callback) {
		this.#after.delete(callback);
		return this;
	}
	removeError(callback) {
		this.#error.delete(callback);
		return this;
	}
	runBefore(context) {
		for (const callback of this.#before) if (callback(context) === false) return false;
	}
	runAfter(context) {
		for (const callback of this.#after) callback(context);
	}
	runError(context) {
		for (const callback of this.#error) callback(context);
	}
};
//#endregion
//#region src/core/registry.js
var Registry = class {
	#actions = /* @__PURE__ */ new Map();
	#gates = /* @__PURE__ */ new Map();
	#triggers = /* @__PURE__ */ new Map();
	#eventModifiers = /* @__PURE__ */ new Map();
	#activeActions = null;
	addAction(name, action, group = null) {
		this.#actions.set(name, {
			action,
			group
		});
	}
	getAction(name) {
		const entry = this.#actions.get(name);
		return entry ? entry.action : void 0;
	}
	hasAction(name) {
		return this.#actions.has(name);
	}
	setActiveActions(actionNames) {
		this.#activeActions = actionNames;
	}
	isAllowed(actionName) {
		if (!this.#activeActions) return true;
		return this.#activeActions.has(actionName);
	}
	addGate(name, gate) {
		this.#gates.set(name, gate);
	}
	getGate(name) {
		return this.#gates.get(name);
	}
	hasGate(name) {
		return this.#gates.has(name);
	}
	addTrigger(name, trigger) {
		this.#triggers.set(name, trigger);
	}
	getTrigger(name) {
		return this.#triggers.get(name);
	}
	hasTrigger(name) {
		return this.#triggers.has(name);
	}
	addEventModifier(name, eventModifier) {
		this.#eventModifiers.set(name, eventModifier);
	}
	getEventModifier(name) {
		return this.#eventModifiers.get(name);
	}
};
//#endregion
//#region src/core/deprecation.js
const warned = /* @__PURE__ */ new Set();
const removalVersion = "1.0.0";
const deprecation = { warn(message) {
	if (warned.has(message)) return;
	warned.add(message);
	console.warn(`[deprecation] ${message} (will be removed in ${removalVersion}) See https://attractivejs.railsdesigner.com/upgrade`);
} };
//#endregion
//#region src/core/attributes.js
const RESERVED = /* @__PURE__ */ new Set([
	"@target",
	"@targets",
	"data-target",
	"data-targets"
]);
function actionAttributes(element) {
	if (!element || !element.attributes) return false;
	for (const attribute of element.attributes) {
		if (RESERVED.has(attribute.name)) continue;
		if (attribute.name.startsWith("@")) return true;
	}
	return element.hasAttribute("data-action");
}
function getActionAttributes({ on: element }) {
	const attributes = [];
	for (const attribute of element.attributes) {
		if (RESERVED.has(attribute.name)) continue;
		if (attribute.name.startsWith("@")) attributes.push(parseAttribute(attribute.name, attribute.value));
	}
	if (attributes.length === 0 && element.hasAttribute("data-action")) {
		const value = element.getAttribute("data-action");
		if (value !== null) {
			deprecation.warn("`data-action` is deprecated, use `@action` instead.");
			attributes.push({
				event: null,
				modifiers: [],
				value
			});
		}
	}
	return attributes;
}
function parseAttribute(name, value) {
	if (name === "@action" || name === "@") return {
		event: null,
		modifiers: [],
		value
	};
	const parts = name.slice(1).split(".");
	return {
		event: parts[0],
		modifiers: parts.slice(1).flatMap((part) => part.split("+")),
		value
	};
}
function getTargetValue(element) {
	const value = element.getAttribute("@target");
	if (value !== null) return value;
	const legacy = element.getAttribute("data-target");
	if (legacy !== null) deprecation.warn("`data-target` is deprecated, use `@target` instead.");
	return legacy;
}
function getTargetsValue(element) {
	const value = element.getAttribute("@targets");
	if (value !== null) return value;
	const legacy = element.getAttribute("data-targets");
	if (legacy !== null) deprecation.warn("`data-targets` is deprecated, use `@targets` instead.");
	return legacy;
}
//#endregion
//#region src/core/events/evaluate.js
var Evaluate = class {
	#registry;
	constructor(registry) {
		this.#registry = registry;
	}
	async run(action, { for: event, on: element, using: defaultEventType, triggeredBy: directive }, { execute }) {
		if (action.startsWith("js:")) return await execute(action, { with: {
			on: element,
			for: event,
			triggeredBy: directive || null
		} });
		if (action.includes(":")) action = this.#stripDirectives({
			from: action,
			for: event,
			on: element
		});
		if (action === void 0) return;
		return await execute(action, { with: {
			on: element,
			for: event,
			triggeredBy: directive || null
		} });
	}
	#stripDirectives({ from: action, for: event, on: element }) {
		const [base, ...directives] = action.split(":");
		if (!directives.filter((name) => !(this.#registry.hasTrigger(name) && event.type === name)).every((name) => this.#passes(name, {
			for: event,
			on: element
		}))) return;
		return base;
	}
	#passes(name, { for: event, on: element }) {
		const gated = this.#registry.getGate(name);
		if (!gated) return event.type === name;
		return gated(element, { event }) !== false;
	}
};
//#endregion
//#region src/debug.js
var Debug = class {
	static enabled = false;
	static prefix = "🧲 ";
	static log(...args) {
		if (this.enabled) console.log(this.prefix, ...args);
	}
	static warn(...args) {
		if (this.enabled) console.warn(this.prefix, ...args);
	}
	static error(...args) {
		if (this.enabled) console.error(this.prefix, ...args);
	}
};
//#endregion
//#region src/core/events/execute.js
var Execute = class {
	#registry;
	#hooks;
	#onError;
	#getTargetValue;
	#getTargetsValue;
	constructor(registry, hooks, onError, getTargetValue, getTargetsValue) {
		this.#registry = registry;
		this.#hooks = hooks;
		this.#onError = onError;
		this.#getTargetValue = getTargetValue;
		this.#getTargetsValue = getTargetsValue;
	}
	async run(action, { with: { on: element, for: event, triggeredBy: directive } }) {
		const resolved = this.#resolve({ from: action });
		if (resolved === void 0) return;
		const { name, value } = resolved;
		const target = this.#getTargetValue(element);
		const targets = this.#getTargetsValue(element);
		const hookContext = this.#hookContext({
			name,
			value,
			on: element,
			for: event,
			target,
			targets
		});
		const actionContext = this.#actionContext({
			name,
			value,
			on: element,
			for: event,
			target,
			targets,
			triggeredBy: directive
		});
		if (this.#hooks?.runBefore(hookContext) === false) {
			event?.preventDefault();
			return false;
		}
		const startTime = performance.now();
		const result = await this.#invoke({
			name,
			on: element,
			context: actionContext
		});
		const elapsed = performance.now() - startTime;
		this.#hooks?.runAfter({
			...hookContext,
			result
		});
		this.#log({
			name,
			on: element,
			for: event,
			elapsed,
			target
		});
		if (result === false && event) event.preventDefault();
		return result;
	}
	#resolve({ from: action }) {
		if (action.startsWith("js:")) return {
			name: "js",
			value: action.slice(3)
		};
		const parts = action.split("#");
		const [possibleAction, fallbackAction, fallbackValue] = parts;
		const name = this.#registry.hasAction(possibleAction) ? possibleAction : this.#registry.hasAction(fallbackAction) ? fallbackAction : action;
		if (!this.#registry.isAllowed(name)) return;
		if (typeof this.#registry.getAction(name) !== "function") return;
		return {
			name,
			value: this.#registry.hasAction(possibleAction) ? parts.slice(1).join("#") : fallbackValue ?? null
		};
	}
	#hookContext({ name, value, on: element, for: event, target, targets }) {
		return {
			name,
			element,
			options: {
				value,
				target,
				targets
			},
			event: event || null
		};
	}
	#actionContext({ name, value, on: element, for: event, target, targets, triggeredBy: directive }) {
		return {
			value,
			target,
			targets,
			event: event || null,
			actionName: name,
			triggeredBy: directive || null,
			dataset: element.dataset
		};
	}
	async #invoke({ name, on: element, context }) {
		try {
			const Action = this.#registry.getAction(name);
			if (typeof Action === "function" && Action.prototype?.run) {
				const instance = new Action(element, context);
				instance.currentElement = element;
				instance.options = context;
				return await instance.run();
			}
			return await Action(element, context);
		} catch (error) {
			this.#reportError({
				name,
				on: element,
				error
			});
		}
	}
	#reportError({ name: actionName, on: element, error }) {
		const targetId = element.id || this.#getTargetValue(element) || "";
		const message = `${actionName} on ${element.tagName.toLowerCase()}#${targetId}: ${error.message}`;
		Debug.error(message);
		if (this.#hooks) this.#hooks.runError({
			name: actionName,
			element,
			error
		});
		if (this.#onError) this.#onError(error, message, {
			actionName,
			element
		});
	}
	#log({ name, on: element, for: event, elapsed, target }) {
		const targetId = element.id || target || "";
		const ref = targetId ? `#${targetId}` : "";
		const tag = element.tagName.toLowerCase();
		Debug.log(`${name} → ${tag}${ref} (${elapsed.toFixed(2)}ms) [${event?.type}]`);
	}
};
//#endregion
//#region src/core/events.js
var Events = class {
	#evaluate;
	#execute;
	constructor(registry, hooks, onError) {
		this.#evaluate = new Evaluate(registry);
		this.#execute = new Execute(registry, hooks, onError, (element) => getTargetValue(element), (element) => getTargetsValue(element));
	}
	async process(event, { on: element, using: defaultEventType, triggeredBy: directive, with: actionValue }) {
		if (!element || !actionValue) return;
		for (const action of this.#splitActions(actionValue)) if (await this.#evaluate.run(action, {
			for: event,
			on: element,
			using: defaultEventType,
			triggeredBy: directive
		}, { execute: (action, context) => this.#execute.run(action, context) }) === false) return false;
	}
	#splitActions(action) {
		if (action.startsWith("js:")) return [action];
		return action.split(" ").filter((action) => action);
	}
};
//#endregion
//#region src/core/event_types.js
var EventTypes = class {
	getDefault({ from: element }) {
		const tagName = element.tagName.toLowerCase();
		const isInput = tagName === "input";
		const inputType = isInput ? element.type || "text" : null;
		return isInput ? this.#defaultEvents.input[inputType] || this.#defaultEvents.input.default : this.#defaultEvents[tagName] || this.#defaultEvents.default;
	}
	#defaultEvents = {
		a: "click",
		button: "click",
		input: {
			checkbox: "change",
			radio: "change",
			submit: "click",
			button: "click",
			reset: "click",
			default: "input"
		},
		select: "change",
		textarea: "input",
		form: "submit",
		default: "click"
	};
};
//#endregion
//#region src/core/triggers.js
var Triggers = class {
	#registry;
	constructor(registry) {
		this.#registry = registry;
	}
	setup({ for: directive, on: element, trigger: run }) {
		const trigger = this.#registry.getTrigger(directive);
		if (!trigger) return false;
		trigger(element, run);
		return true;
	}
};
//#endregion
//#region src/core/element_lifecycle_hooks.js
var ElementLifecycleHooks = class {
	#added = /* @__PURE__ */ new Set();
	#removed = /* @__PURE__ */ new Set();
	#beforeRemove = /* @__PURE__ */ new Set();
	onAdded(callback) {
		this.#added.add(callback);
		return this;
	}
	onRemoved(callback) {
		this.#removed.add(callback);
		return this;
	}
	onBeforeRemove(callback) {
		this.#beforeRemove.add(callback);
		return this;
	}
	runAdded(element) {
		this.#added.forEach((fn) => fn(element));
	}
	runRemoved(element) {
		this.#removed.forEach((fn) => fn(element));
	}
	runBeforeRemove(element) {
		this.#beforeRemove.forEach((fn) => fn(element));
	}
	clear() {
		this.#added.clear();
		this.#removed.clear();
		this.#beforeRemove.clear();
	}
};
//#endregion
//#region src/core/event_subscriptions.js
var EventSubscriptions = class {
	#subscriptions = /* @__PURE__ */ new Map();
	#scope = document;
	setScope(scope) {
		this.#scope = scope;
	}
	add(type, callback) {
		if (!this.#subscriptions.has(type)) {
			const listener = (event) => {
				this.#subscriptions.get(type).subscriptions.forEach((fn) => fn(event));
			};
			this.#scope.addEventListener(type, listener);
			this.#subscriptions.set(type, {
				listener,
				subscriptions: /* @__PURE__ */ new Set()
			});
		}
		this.#subscriptions.get(type).subscriptions.add(callback);
		return this;
	}
	removeAll() {
		this.#subscriptions.forEach(({ listener }, type) => {
			this.#scope.removeEventListener(type, listener);
		});
		this.#subscriptions.clear();
	}
};
//#endregion
//#region src/core/attribute_prefixes.js
var AttributePrefixes = class {
	#prefixes = /* @__PURE__ */ new Set();
	add(prefix) {
		this.#prefixes.add(prefix);
		return this;
	}
	matches(element) {
		if (actionAttributes(element)) return true;
		return Array.from(this.#prefixes).some((prefix) => Array.from(element.attributes).some((attribute) => attribute.name.startsWith(prefix)));
	}
	clear() {
		this.#prefixes.clear();
	}
};
//#endregion
//#region src/core/helpers/debounce.js
const debounce = () => {
	let timeoutId;
	return (callback, delay) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(callback, delay);
	};
};
//#endregion
//#region src/core/actions.js
const debounceTimers = /* @__PURE__ */ new WeakMap();
var Actions = class Actions {
	static #nonBubblingEvents = /* @__PURE__ */ new Set([
		"mouseenter",
		"mouseleave",
		"focus",
		"blur",
		"load",
		"error",
		"unload",
		"resize",
		"scroll"
	]);
	#registry;
	#events;
	#eventTypes;
	#triggers;
	#listeners;
	#element;
	#scope;
	constructor(registry, events, eventTypes, triggers, listeners, element) {
		this.#registry = registry;
		this.#events = events;
		this.#eventTypes = eventTypes;
		this.#triggers = triggers;
		this.#listeners = listeners;
		this.#element = element;
		this.#scope = element;
	}
	prepare(element) {
		const attributes = getActionAttributes({ on: element });
		if (attributes.length === 0) return;
		this.#registerDirectListeners({
			on: element,
			from: attributes
		});
		this.#registerDelegationListeners({
			on: element,
			from: attributes
		});
		this.#setupDirectiveTriggers({
			on: element,
			from: attributes
		});
	}
	process(event, context = null) {
		const element = context ? context.element : this.#actionElement(event.target);
		if (!element) return;
		if (!this.#scope.contains(element)) return;
		const delay = this.#debounceDelay(element);
		if (delay > 0) {
			let timer = debounceTimers.get(element);
			if (!timer) {
				timer = debounce();
				debounceTimers.set(element, timer);
			}
			timer(() => this.#execute({
				event,
				with: context,
				on: element
			}), delay);
			return;
		}
		this.#execute({
			event,
			with: context,
			on: element
		});
	}
	#debounceDelay(element) {
		return parseInt(element.dataset.debounce ?? element.dataset.formDebounce ?? element.dataset.requestDebounce ?? 0);
	}
	#execute({ event, with: context, on: element }) {
		if (!this.#scope.contains(element)) return;
		const defaultEventType = context ? context.eventType : this.#defaultEventType({ for: element });
		const attributes = getActionAttributes({ on: element });
		for (const { event: eventName, modifiers, value } of attributes) {
			if ((eventName !== null ? eventName : defaultEventType) !== event.type) continue;
			if (this.#blockedByEventModifiers({
				for: event,
				on: element,
				modifiers
			})) continue;
			this.#events.process(event, {
				on: element,
				using: defaultEventType,
				with: value
			});
		}
	}
	#blockedByEventModifiers({ for: event, on: element, modifiers }) {
		return modifiers.some((name) => {
			const eventModifier = this.#registry.getEventModifier(name);
			if (eventModifier) return eventModifier(event, element) === false;
			if (event.key === void 0) return false;
			return event.key.toLowerCase() !== name.toLowerCase();
		});
	}
	#registerDirectListeners({ on: element, from: attributes }) {
		for (const { event: eventName, modifiers, value } of attributes) {
			const eventType = eventName || this.#defaultEventType({ for: element });
			if (modifiers.includes("window") || modifiers.includes("document")) {
				const target = modifiers.includes("window") ? window : document;
				this.#listeners.addTargetedEventListener({
					for: eventType,
					on: target,
					element
				});
				continue;
			}
			if (Actions.#nonBubblingEvents.has(eventType)) element.addEventListener(eventType, (event) => this.#events.process(event, {
				on: element,
				using: this.#defaultEventType({ for: element }),
				with: value
			}));
		}
	}
	#registerDelegationListeners({ on: element, from: attributes }) {
		const eventTypes = /* @__PURE__ */ new Set();
		for (const { event: eventName, modifiers } of attributes) {
			if (modifiers.includes("window") || modifiers.includes("document")) continue;
			const eventType = eventName || this.#defaultEventType({ for: element });
			if (Actions.#nonBubblingEvents.has(eventType)) continue;
			eventTypes.add(eventType);
		}
		eventTypes.forEach((eventType) => {
			this.#listeners.addEventListeners({
				for: eventType,
				on: this.#element
			});
		});
	}
	#setupDirectiveTriggers({ on: element, from: attributes }) {
		const directives = [...new Set(attributes.filter(({ value }) => !value.startsWith("js:")).flatMap(({ value }) => value.split(" ").filter((name) => name.includes(":")).flatMap((name) => name.split(":").slice(1))))];
		const defaultEventType = this.#defaultEventType({ for: element });
		directives.forEach((name) => {
			this.#triggers.setup({
				for: name,
				on: element,
				trigger: () => {
					attributes.forEach(({ value }) => {
						this.#events.process({ type: name }, {
							on: element,
							using: defaultEventType,
							triggeredBy: name,
							with: value
						});
					});
				}
			});
		});
	}
	#defaultEventType({ for: element }) {
		return this.#eventTypes.getDefault({ from: element });
	}
	#actionElement(element) {
		while (element) {
			if (actionAttributes(element)) return element;
			element = element.parentElement;
		}
		return null;
	}
};
//#endregion
//#region src/core/event_listeners.js
var EventListeners = class {
	#eventListeners = /* @__PURE__ */ new Map();
	#elementListeners = /* @__PURE__ */ new WeakMap();
	#targetedEventListeners = /* @__PURE__ */ new Map();
	#targetedEvents = /* @__PURE__ */ new Map();
	#process;
	constructor(process) {
		this.#process = process;
	}
	addEventListeners({ for: eventType, on: element }) {
		if (this.#eventListeners.has(eventType)) return;
		const processEvent = (event) => this.#process(event);
		element.addEventListener(eventType, processEvent);
		Debug.log("Added event listener for", eventType, "to", element);
		this.#eventListeners.set(eventType, {
			listener: processEvent,
			element
		});
	}
	addTargetedEventListener({ for: eventType, on: target, element }) {
		const key = `${target === window ? "window" : "document"}:${eventType}`;
		if (!this.#elementListeners.has(element)) this.#elementListeners.set(element, /* @__PURE__ */ new Set());
		this.#elementListeners.get(element).add(key);
		if (!this.#targetedEvents.has(key)) this.#targetedEvents.set(key, /* @__PURE__ */ new Set());
		this.#targetedEvents.get(key).add(element);
		if (!this.#targetedEventListeners.has(key)) {
			const processElements = (event) => {
				const elements = this.#targetedEvents.get(key);
				if (!elements) return;
				elements.forEach((element) => {
					this.#process(event, {
						element,
						eventType
					});
				});
			};
			target.addEventListener(eventType, processElements);
			this.#targetedEventListeners.set(key, processElements);
		}
	}
	cleanup(element) {
		const keys = this.#elementListeners.get(element);
		if (!keys) return;
		keys.forEach((key) => {
			const events = this.#targetedEvents.get(key);
			if (events) {
				events.delete(element);
				if (events.size === 0) {
					const [targetName, eventType] = key.split(":");
					const listener = this.#targetedEventListeners.get(key);
					(targetName === "window" ? window : document).removeEventListener(eventType, listener);
					this.#targetedEventListeners.delete(key);
					this.#targetedEvents.delete(key);
				}
			}
		});
		this.#elementListeners.delete(element);
	}
	removeAll() {
		for (const [eventType, { listener, element }] of this.#eventListeners) element.removeEventListener(eventType, listener);
		this.#eventListeners.clear();
		for (const [key, listener] of this.#targetedEventListeners) {
			const [targetName, eventType] = key.split(":");
			(targetName === "window" ? window : document).removeEventListener(eventType, listener);
		}
		this.#targetedEventListeners.clear();
		this.#targetedEvents.clear();
		this.#elementListeners = /* @__PURE__ */ new WeakMap();
	}
};
//#endregion
//#region src/core/observer.js
const ELEMENT_NODE = typeof Node !== "undefined" && Node.ELEMENT_NODE || 1;
const ATTRIBUTE_PREFIX = "@";
const RESERVED_ATTRIBUTES = /* @__PURE__ */ new Set(["@target", "@targets"]);
var Observer = class {
	#prepare;
	#cleanup;
	#beforeCleanup;
	#observer;
	#scope;
	constructor(prepare, cleanup = null, scope = document.documentElement, beforeCleanup = null) {
		this.#prepare = prepare;
		this.#cleanup = cleanup;
		this.#beforeCleanup = beforeCleanup;
		this.#scope = scope;
	}
	start(action) {
		if (!window.MutationObserver) return;
		this.#observer = new MutationObserver((mutations) => {
			const added = /* @__PURE__ */ new Set();
			const removed = /* @__PURE__ */ new Set();
			const changed = /* @__PURE__ */ new Set();
			for (const mutation of mutations) {
				if (mutation.type === "childList") {
					this.#processChildMutation(mutation, {
						for: action,
						elements: {
							added,
							removed
						}
					});
					continue;
				}
				if (mutation.type === "attributes" && mutation.attributeName.startsWith(ATTRIBUTE_PREFIX) && !RESERVED_ATTRIBUTES.has(mutation.attributeName)) changed.add(mutation.target);
			}
			added.forEach((element) => {
				Debug.log("Element added:", element.tagName.toLowerCase(), "#" + (element.id || element.dataset.target || ""));
				this.#prepare(element);
			});
			if (this.#beforeCleanup || this.#cleanup) removed.forEach((element) => {
				Debug.log("Element removed:", element.tagName.toLowerCase(), "#" + (element.id || ""));
				this.#beforeCleanup?.(element);
				this.#cleanup?.(element);
			});
			if (this.#cleanup) changed.forEach((element) => {
				if (removed.has(element)) return;
				Debug.log("Attribute changed:", element.tagName.toLowerCase(), "#" + (element.id || ""));
				this.#cleanup(element);
				if (action(element)) this.#prepare(element);
			});
		});
		this.#observer.observe(this.#scope, {
			childList: true,
			subtree: true,
			attributes: true
		});
		return this;
	}
	stop() {
		if (this.#observer) this.#observer.disconnect();
		return this;
	}
	#processChildMutation(mutation, { for: action, elements: { added, removed } }) {
		mutation.addedNodes.forEach((node) => {
			this.#processNode(node, {
				for: action,
				and: added
			});
		});
		mutation.removedNodes.forEach((node) => {
			this.#processNode(node, {
				for: action,
				and: removed
			});
		});
	}
	#processNode(node, { for: action, and: elements }) {
		if (node.nodeType !== ELEMENT_NODE) return;
		if (action(node)) elements.add(node);
		if (!node.querySelectorAll) return;
		node.querySelectorAll("*").forEach((element) => {
			if (action(element)) elements.add(element);
		});
	}
};
//#endregion
//#region src/core/activation.js
var Activation = class {
	#registry;
	#scope;
	#events;
	#eventTypes;
	#triggers;
	#listeners;
	#elementLifecycle;
	#subscriptions;
	#attributePrefixes;
	#owner;
	#actions;
	#observe;
	#initialized = false;
	constructor(dependencies) {
		this.#registry = dependencies.registry;
		this.#events = dependencies.events;
		this.#eventTypes = dependencies.eventTypes;
		this.#triggers = dependencies.triggers;
		this.#elementLifecycle = dependencies.elementLifecycle;
		this.#subscriptions = dependencies.subscriptions;
		this.#attributePrefixes = dependencies.attributePrefixes;
		this.#owner = dependencies.owner;
		this.#listeners = new EventListeners((event, context) => this.#actions?.process(event, context));
	}
	get active() {
		return this.#initialized;
	}
	activate(options = {}) {
		const { on = document, debug = false, extendWith = [], addActions = {}, addGates = {}, addTriggers = {} } = options;
		Debug.enabled = debug;
		if (!on) {
			Debug.error("scope element not found: activate() requires a valid DOM element");
			return this;
		}
		if (this.#initialized) return this;
		for (const [name, action] of Object.entries(addActions)) this.#registry.addAction(name, action);
		for (const [name, action] of Object.entries(addGates)) this.#registry.addGate(name, action);
		for (const [name, action] of Object.entries(addTriggers)) this.#registry.addTrigger(name, action);
		this.#scope = on;
		this.#subscriptions.setScope(on);
		this.#actions = new Actions(this.#registry, this.#events, this.#eventTypes, this.#triggers, this.#listeners, on);
		this.#observe = new Observer((element) => {
			this.#actions.prepare(element);
			this.#elementLifecycle.runAdded(element);
		}, (element) => {
			this.#listeners.cleanup(element);
			this.#elementLifecycle.runRemoved(element);
		}, on, (element) => {
			this.#elementLifecycle.runBeforeRemove(element);
		});
		const elements = on.querySelectorAll("*");
		const actionElements = [];
		for (const element of elements) if (this.#attributePrefixes.matches(element)) actionElements.push(element);
		for (const extension of extendWith) extension({
			instance: this.#owner,
			registry: this.#registry
		});
		actionElements.forEach((element) => {
			this.#actions.prepare(element);
		});
		this.#observe.start((element) => this.#attributePrefixes.matches(element));
		actionElements.forEach((element) => {
			this.#elementLifecycle.runAdded(element);
		});
		this.#initialized = true;
		if (Debug.enabled) Debug.log(`active — ${actionElements.length} element${actionElements.length === 1 ? "" : "s"} with actions`);
		return this;
	}
	deactivate() {
		if (!this.#initialized) return this;
		this.#listeners.removeAll();
		if (this.#observe) this.#observe.stop();
		this.#subscriptions.removeAll();
		this.#elementLifecycle.clear();
		this.#attributePrefixes.clear();
		this.#initialized = false;
		Debug.log("deactivated");
		return this;
	}
};
//#endregion
//#region src/core/default_event_modifier.js
function defaultEventModifier(registry) {
	registry.addEventModifier("window", () => true);
	registry.addEventModifier("document", () => true);
}
//#endregion
//#region src/core.js
var Attractive = class Attractive {
	#registry = new Registry();
	#events;
	#eventTypes;
	#triggers;
	#activation;
	#hooks = new Hooks();
	#elementLifecycle = new ElementLifecycleHooks();
	#subscriptions = new EventSubscriptions();
	#attributePrefixes = new AttributePrefixes();
	static activate(options = {}) {
		const instance = new this(options);
		instance.activate(options);
		return instance;
	}
	/**
	* Returns whether debug logging is enabled.
	*
	* @returns {boolean} — current debug state
	*/
	static get debug() {
		return Debug.enabled;
	}
	/**
	* Toggle debug logging on or off.
	*
	* @param {boolean} value — true to enable debug output
	*/
	static set debug(value) {
		Debug.enabled = value;
	}
	get debug() {
		return Debug.enabled;
	}
	set debug(value) {
		Debug.enabled = value;
	}
	/**
	* Returns whether the instance is currently active.
	*
	* @returns {boolean} — true if activate() has been called and deactivate() has not
	*/
	get active() {
		return this.#activation.active;
	}
	static onError(error, message) {
		console.warn(`[attractive] ${message}`, error);
		if (typeof window.onerror === "function") window.onerror(message, null, null, null, error);
	}
	constructor() {
		this.#events = new Events(this.#registry, this.#hooks, (error, message, detail) => Attractive.onError(error, message, detail));
		this.#eventTypes = new EventTypes();
		this.#triggers = new Triggers(this.#registry);
		defaultEventModifier(this.#registry);
		this.#activation = new Activation({
			registry: this.#registry,
			events: this.#events,
			eventTypes: this.#eventTypes,
			triggers: this.#triggers,
			elementLifecycle: this.#elementLifecycle,
			subscriptions: this.#subscriptions,
			attributePrefixes: this.#attributePrefixes,
			owner: this
		});
	}
	/**
	* Activates the Attractive instance on the given scope.
	*
	* @param {Object} [options] — activation options
	* @param {HTMLElement|Document} [options.on=document] — root element to observe
	* @param {boolean} [options.debug=false] — enable debug logging
	* @returns {Attractive} — the instance for chaining
	*/
	activate(options = {}) {
		this.#activation.activate(options);
		return this;
	}
	/**
	* Restricts available actions to the given names.
	*
	* @param {string[]} [actionNames] — action names to enable (all enabled if empty)
	* @returns {Attractive} — the instance for chaining
	*/
	withActions(actionNames = []) {
		Debug.log("Initializing with actions", actionNames);
		if (actionNames.length > 0) this.#registry.setActiveActions(new Set(actionNames));
		return this;
	}
	/**
	* Registers a callback that runs before each action.
	* Return false to cancel the action.
	*
	* @param {Function} callback — receives { name, element, options, event }
	* @returns {Attractive} — the instance for chaining
	*/
	beforeAction(callback) {
		this.#hooks.addBefore(callback);
		return this;
	}
	/**
	* Registers a callback that runs after each successful action.
	*
	* @param {Function} callback — receives { name, element, options, event, result }
	* @returns {Attractive} — the instance for chaining
	*/
	afterAction(callback) {
		this.#hooks.addAfter(callback);
		return this;
	}
	/**
	* Registers a callback that runs when an action throws an error.
	*
	* @param {Function} callback — receives { name, element, options, event, error }
	* @returns {Attractive} — the instance for chaining
	*/
	onError(callback) {
		this.#hooks.addError(callback);
		return this;
	}
	/**
	* Deactivates the instance, removing all event listeners and observer.
	*
	* @returns {Attractive} — the instance for chaining
	*/
	deactivate() {
		this.#activation.deactivate();
		return this;
	}
	/**
	* Deactivates and reactivates the instance with optional new options.
	*
	* @param {Object} [options] — same options as activate()
	* @returns {Attractive} — the instance for chaining
	*/
	restart(options = {}) {
		this.deactivate();
		return this.activate(options);
	}
	onElementAdded(callback) {
		this.#elementLifecycle.onAdded(callback);
		return this;
	}
	onElementRemoved(callback) {
		this.#elementLifecycle.onRemoved(callback);
		return this;
	}
	onBeforeElementRemoved(callback) {
		this.#elementLifecycle.onBeforeRemove(callback);
		return this;
	}
	addEventListener(type, callback) {
		this.#subscriptions.add(type, callback);
		return this;
	}
	observeAttribute(prefix) {
		this.#attributePrefixes.add(prefix);
		return this;
	}
};
//#endregion
//#region src/actions/base.js
var ActionBase = class {
	static actionFor(method) {
		return (element, options = {}) => {
			return new this(element, options)[method]();
		};
	}
	constructor(currentElement, options = {}) {
		if (!currentElement) throw new Error("Current element is required");
		this.currentElement = currentElement;
		this.target = options.target;
		this.targetsSelector = options.targets;
		this.options = options;
	}
	get targets() {
		if (this.targetsSelector) return Array.from(document.querySelectorAll(this.targetsSelector));
		if (this.target) {
			const element = document.getElementById(this.target);
			if (!element) Debug.warn(`Target "#${this.target}" not found`);
			return element ? [element] : [];
		}
		return [this.currentElement];
	}
	cycledValue(currentValue, nextValues) {
		const values = Array.isArray(nextValues) ? nextValues : nextValues.split(",").map((value) => value.trim());
		return values[(values.indexOf(currentValue) + 1) % values.length];
	}
};
//#endregion
//#region src/action-class/index.js
var Action = class extends ActionBase {
	get value() {
		return this.options.value;
	}
	get dataset() {
		return this.currentElement.dataset;
	}
	dispatchEvent(name, detail = {}) {
		this.currentElement.dispatchEvent(new CustomEvent(name, {
			bubbles: true,
			detail
		}));
	}
};
//#endregion
//#region src/actions/helpers/sanitize.js
const sanitize = (value) => {
	return value?.split(",").map((className) => className.trim()).filter(Boolean) ?? [];
};
//#endregion
//#region src/actions/class.js
var Class = class extends ActionBase {
	constructor(currentElement, options = {}) {
		super(currentElement, options);
		this.value = sanitize(options.value);
	}
	toggle() {
		if (!this.value) return;
		this.targets.forEach((target) => this.#toggleClasses({ forEach: target }));
	}
	cycle() {
		if (!this.value || this.value.length === 0) return;
		this.targets.forEach((target) => this.#cycleClasses(target));
	}
	add() {
		if (!this.value) return;
		this.targets.forEach((target) => target.classList.add(...this.value));
	}
	set() {
		if (!this.value) return;
		this.targets.forEach((target) => {
			target.className = "";
			target.classList.add(...this.value);
		});
	}
	remove() {
		if (!this.value) return;
		this.targets.forEach((target) => target.classList.remove(...this.value));
	}
	#toggleClasses({ forEach: target }) {
		this.value.forEach((className) => target.classList.toggle(className));
	}
	#cycleClasses(target) {
		const currentClass = this.value.find((className) => target.classList.contains(className)) || "";
		const nextClass = this.cycledValue(currentClass, this.value);
		target.classList.remove(...this.value);
		target.classList.add(nextClass);
	}
};
const actions$9 = {
	toggleClass: Class.actionFor("toggle"),
	cycleClass: Class.actionFor("cycle"),
	addClass: Class.actionFor("add"),
	setClass: Class.actionFor("set"),
	removeClass: Class.actionFor("remove")
};
//#endregion
//#region src/actions/helpers/delay.js
const delay = () => {
	let timeoutId;
	return (callback, delay) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(callback, delay);
	};
};
//#endregion
//#region src/actions/clipboard.js
const clearFeedback$1 = delay();
var Clipboard = class extends ActionBase {
	constructor(currentElement, options = {}) {
		super(currentElement, options);
		this.value = options.value;
	}
	async copy() {
		const textToCopy = this.value || (this.targets[0]?.value ?? this.targets[0]?.textContent);
		if (textToCopy === void 0) return;
		try {
			await navigator.clipboard.writeText(textToCopy);
			this.#setFeedback(true);
		} catch (error) {
			this.#setFeedback(false);
		}
	}
	#setFeedback(succeeded) {
		const delay = parseInt(this.currentElement.dataset.copyFeedback);
		this.targets.forEach((target) => target.setAttribute(this.#attributeName, succeeded));
		if (!delay) return;
		clearFeedback$1(() => this.targets.forEach((target) => target.removeAttribute(this.#attributeName)), delay);
	}
	get #attributeName() {
		return "data-copy-success";
	}
};
const actions$8 = { copy: Clipboard.actionFor("copy") };
//#endregion
//#region src/actions/confirm.js
const clearFeedback = delay();
var Confirm = class extends ActionBase {
	confirm() {
		const message = this.currentElement.dataset.confirmMessage || "Are you sure?";
		const confirmed = window.confirm(message);
		this.#setFeedback(confirmed);
		return confirmed;
	}
	#setFeedback(confirmed) {
		this.currentElement.setAttribute("data-confirm-success", confirmed);
		const duration = this.currentElement.dataset.confirmFeedback;
		if (!duration) return;
		clearFeedback(() => this.currentElement.removeAttribute("data-confirm-success"), parseInt(duration));
	}
};
const actions$7 = { confirm: Confirm.actionFor("confirm") };
//#endregion
//#region src/actions/dom_attributes.js
const attributeOperations = {
	get(element, name) {
		return element.getAttribute(name);
	},
	set(element, name, value) {
		element.setAttribute(name, value);
	},
	has(element, name) {
		return element.hasAttribute(name);
	},
	remove(element, name) {
		element.removeAttribute(name);
	}
};
const dataAttributeOperations = {
	get(element, name) {
		return element.dataset[name];
	},
	set(element, name, value) {
		element.dataset[name] = value;
	},
	has(element, name) {
		return name in element.dataset;
	},
	remove(element, name) {
		delete element.dataset[name];
	}
};
var DOMAttribute = class extends ActionBase {
	constructor(currentElement, options = {}) {
		super(currentElement, options);
		const [attribute, value] = options.value.split("=");
		this.attribute = attribute;
		this.value = value;
	}
	toggle() {
		if (!this.attribute) return;
		this.targets.forEach((target) => this.operations.has(target, this.attribute) ? this.operations.remove(target, this.attribute) : this.operations.set(target, this.attribute, this.value || ""));
	}
	cycle() {
		if (!this.value) return;
		this.targets.forEach((target) => this.#cycleAttribute(target));
	}
	add() {
		if (!this.attribute) return;
		this.targets.forEach((target) => this.operations.set(target, this.attribute, this.value || ""));
	}
	set() {
		return this.add();
	}
	remove() {
		if (!this.attribute) return;
		this.targets.forEach((target) => this.operations.remove(target, this.attribute));
	}
	#cycleAttribute(target) {
		const currentValue = this.operations.get(target, this.attribute);
		const nextValue = this.cycledValue(currentValue, this.value);
		this.operations.set(target, this.attribute, nextValue);
	}
};
var Attribute = class extends DOMAttribute {
	get operations() {
		return attributeOperations;
	}
};
var DataAttribute = class extends DOMAttribute {
	get operations() {
		return dataAttributeOperations;
	}
};
const toggleAttribute = Attribute.actionFor("toggle");
const cycleAttribute = Attribute.actionFor("cycle");
const addAttribute = Attribute.actionFor("add");
const setAttribute = Attribute.actionFor("set");
const removeAttribute = Attribute.actionFor("remove");
const toggleDataAttribute = DataAttribute.actionFor("toggle");
const cycleDataAttribute = DataAttribute.actionFor("cycle");
const addDataAttribute = DataAttribute.actionFor("add");
const setDataAttribute = DataAttribute.actionFor("set");
const removeDataAttribute = DataAttribute.actionFor("remove");
const attributeActions = {
	toggleAttribute,
	cycleAttribute,
	addAttribute,
	setAttribute,
	removeAttribute
};
const dataAttributeActions = {
	toggleDataAttribute,
	cycleDataAttribute,
	addDataAttribute,
	setDataAttribute,
	removeDataAttribute
};
//#endregion
//#region src/actions/dialog.js
var Dialog = class extends ActionBase {
	open() {
		this.targets.forEach((target) => target instanceof HTMLDialogElement && target.show());
	}
	openModal() {
		this.targets.forEach((target) => target instanceof HTMLDialogElement && target.showModal());
	}
	close() {
		this.targets.forEach((target) => target instanceof HTMLDialogElement && target.close());
	}
};
const actions$6 = {
	open: Dialog.actionFor("open"),
	openModal: Dialog.actionFor("openModal"),
	close: Dialog.actionFor("close")
};
//#endregion
//#region src/actions/focus.js
var Focus = class extends ActionBase {
	focus() {
		this.targets.forEach((target) => {
			if (typeof target.focus === "function") target.focus();
		});
	}
};
const actions$5 = { focus: Focus.actionFor("focus") };
//#endregion
//#region src/actions/form.js
var Form = class extends ActionBase {
	requestSubmit() {
		this.targets.forEach((target) => target instanceof HTMLFormElement && target.requestSubmit());
	}
	reset() {
		this.targets.forEach((target) => target instanceof HTMLFormElement && target.reset());
	}
};
const actions$4 = {
	submit: Form.actionFor("requestSubmit"),
	reset: Form.actionFor("reset")
};
//#endregion
//#region src/actions/reload.js
var Reload = class extends ActionBase {
	reload() {
		this.targets.forEach((target) => {
			if (this.#reloadable(target)) target.reload();
		});
	}
	get targets() {
		if (this.target === "window") return [window.location];
		return super.targets;
	}
	#reloadable(target) {
		return typeof target.reload === "function";
	}
};
const reload = Reload.actionFor("reload");
const actions$3 = {
	reload,
	refresh: reload
};
//#endregion
//#region src/actions/scroll_to.js
var ScrollTo = class extends ActionBase {
	constructor(currentElement, options = {}) {
		super(currentElement, options);
		const validBehaviors = [
			"auto",
			"instant",
			"smooth"
		];
		const behavior = options.value;
		this.behavior = validBehaviors.includes(behavior) ? behavior : "auto";
	}
	scroll() {
		this.targets[0]?.scrollIntoView({ behavior: this.behavior });
	}
};
const actions$2 = { scrollTo: ScrollTo.actionFor("scroll") };
//#endregion
//#region src/actions/style.js
var Style = class extends ActionBase {
	constructor(currentElement, options = {}) {
		super(currentElement, options);
		const [prop, value] = (options.value || "").split("=");
		this.styleProperty = prop;
		this.styleValue = value;
	}
	set() {
		if (!this.styleProperty) return;
		this.targets.forEach((target) => target.style.setProperty(this.styleProperty, this.styleValue || ""));
	}
	remove() {
		if (!this.styleProperty) return;
		this.targets.forEach((target) => target.style.removeProperty(this.styleProperty));
	}
	cycle() {
		if (!this.styleValue) return;
		this.targets.forEach((target) => {
			const current = target.style.getPropertyValue(this.styleProperty);
			const next = this.cycledValue(current, this.styleValue);
			target.style.setProperty(this.styleProperty, next);
		});
	}
	toggle() {
		if (!this.styleProperty) return;
		this.targets.forEach((target) => {
			if (target.style.getPropertyValue(this.styleProperty) !== "") target.style.removeProperty(this.styleProperty);
			else target.style.setProperty(this.styleProperty, this.styleValue || "");
		});
	}
};
//#endregion
//#region src/actions/index.js
const actions = {
	attribute: attributeActions,
	class: actions$9,
	clipboard: actions$8,
	confirm: actions$7,
	dataAttribute: dataAttributeActions,
	dialog: actions$6,
	focus: actions$5,
	form: actions$4,
	reload: actions$3,
	scrollTo: actions$2,
	style: {
		setStyle: Style.actionFor("set"),
		removeStyle: Style.actionFor("remove"),
		cycleStyle: Style.actionFor("cycle"),
		toggleStyle: Style.actionFor("toggle")
	}
};
const availableActions = (groups = []) => {
	if (groups.length === 0) return Object.values(actions).reduce((all, group) => ({
		...all,
		...group
	}), {});
	return groups.reduce((selectedActions, group) => {
		const groupActions = actions[group];
		if (!groupActions) {
			console.warn(`Action "${group}" not found`);
			return selectedActions;
		}
		return {
			...selectedActions,
			...groupActions
		};
	}, {});
};
var actions_default = availableActions([]);
//#endregion
//#region src/core/builtin_directives.js
const onceTracker = /* @__PURE__ */ new WeakSet();
const whenIntersecting = (check) => (element, trigger) => {
	let done = false;
	const observer = new IntersectionObserver((entries) => {
		if (check(entries) && !done) {
			done = true;
			observer.disconnect();
			trigger();
		}
	});
	observer.observe(element);
};
const builtinTriggers = {
	mounted: (_, trigger) => {
		trigger();
	},
	now: (_, trigger) => {
		trigger();
	},
	whenVisible: whenIntersecting((entries) => entries.some((entry) => entry.isIntersecting)),
	whenInView: whenIntersecting((entries) => entries[0].isIntersecting)
};
const builtinGates = {
	whenOutside: (element, { event }) => {
		if (typeof element.checkVisibility === "function" && !element.checkVisibility()) return false;
		return !element.contains(event.target);
	},
	once: (element) => {
		if (onceTracker.has(element)) return false;
		onceTracker.add(element);
		return true;
	},
	preventDefault: (element, { event }) => {
		event.preventDefault();
		return true;
	},
	stopPropagation: (element, { event }) => {
		event.stopPropagation();
		return true;
	}
};
//#endregion
//#region src/helpers/from.js
function from(files, { nameFor } = {}) {
	return Object.fromEntries(Object.entries(files).map(([path, module]) => {
		const action = module.default ?? module;
		return [nameFor ? nameFor(path, action) : toCamelCase(filename(path)), action];
	}));
}
function filename(path) {
	return path.split("/").pop().replace(/\.\w+$/, "");
}
function toCamelCase(string) {
	return string.replace(/_([a-z])/g, (_, cased) => cased.toUpperCase());
}
//#endregion
//#region src/index.js
const allBuiltinActions = actions_default;
Attractive.activate = function(options = {}) {
	const attractive = new this(options);
	attractive.activate({
		...options,
		addActions: {
			...allBuiltinActions,
			...options.addActions
		},
		addGates: {
			...builtinGates,
			...options.addGates
		},
		addTriggers: {
			...builtinTriggers,
			...options.addTriggers
		}
	});
	return attractive;
};
if (typeof document !== "undefined" && typeof window !== "undefined" && (document.currentScript ?? document.querySelector("script[src*=\"attractive\"][activate]"))?.hasAttribute("activate")) {
	window.Attractive = Attractive;
	document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => Attractive.activate()) : Attractive.activate();
}
var src_default = Attractive;
//#endregion
export { Action, src_default as default, from };
