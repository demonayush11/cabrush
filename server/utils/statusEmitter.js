import { EventEmitter } from 'events';

const emitter = new EventEmitter();
emitter.setMaxListeners(50);

export function emitStatus(sessionId, data) {
  emitter.emit('status', { sessionId, ...data });
}

export function onStatus(callback) {
  emitter.on('status', callback);
}

export function offStatus(callback) {
  emitter.off('status', callback);
}

export default emitter;
