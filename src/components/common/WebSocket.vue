<script>
import { onUnmounted } from 'vue';

class Socket {
  constructor(url, opts = {}) {
    this.url = url;
    this.ws = null;
    this.opts = {
      heartbeatInterval: 30000,
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      ...opts
    };
    this.reconnectAttempts = 0;
    this.listeners = {};
    this.heartbeatInterval = null;

    this.init();
  }

  init() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = this.onOpen.bind(this);
    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onerror = this.onError.bind(this);
    this.ws.onclose = this.onClose.bind(this);
  }

  onOpen(event) {
    console.log('WebSocket opened:', event);
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.emit('open', event);
  }

  onMessage(event) {
    console.log('WebSocket message received:', event.data);
    this.emit('message', event.data);
  }

  onError(event) {
    console.error('WebSocket error:', event);
    this.emit('error', event);
  }

  onClose(event) {
    console.log('WebSocket closed:', event);
    this.stopHeartbeat();
    this.emit('close', event);

    if (this.reconnectAttempts < this.opts.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.init();
      }, this.opts.reconnectInterval);
    }
  }

  startHeartbeat() {
    if (!this.opts.heartbeatInterval) return;

    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, this.opts.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      console.error('WebSocket is not open. Cannot send:', data);
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event) {
    if (this.listeners[event]) {
      delete this.listeners[event];
    }
  }

  emit(event, data) {
    this.listeners[event]?.forEach(callback => callback(data));
  }
}

export function useSocket(url, opts) {
  const socket = new Socket(url, opts);

  onUnmounted(() => {
    socket.off('open');
    socket.off('message');
    socket.off('error');
    socket.off('close');
  });

  return {
    socket,
    send: socket.send.bind(socket),
    on: socket.on.bind(socket),
    off: socket.off.bind(socket)
  };
}

</script>