const logger = require('./logger');

class ServerEvent {
  constructor(event) {
    this.data = '';
    this.event = event;
  }

  addData(data) {
    const lines = data.split(/\n/);

    for (let i = 0; i < lines.length; i += 1) {
      const element = lines[i];
      this.data += `data:${element}\n`;
    }
  }

  payload() {
    return `event: ${this.event}\n${this.data}\n`;
  }
}

const connect = (req, res, channel) => {
  logger.debug('init SSE');

  const subscriber = channel.subscribe(batchedMessage => {
    const messageEvent = new ServerEvent(batchedMessage.channel);

    batchedMessage.messages.forEach(message => {
      messageEvent.addData(message);
    });

    res.write(messageEvent.payload());
  });

  req.on('close', () => {
    channel.unsubscribe(subscriber);
  });
  req.on('end', () => {
    channel.unsubscribe(subscriber);
  });

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no',
    Connection: 'keep-alive'
  });

  res.write('retry: 10000\n\n');

  // ping the client every 30s to avoid browser error net::ERR_INCOMPLETE_CHUNKED_ENCODING 200 (OK)
  setInterval(() => {
    res.write('event: ping\n\n');
  }, 30000);
};

module.exports = {
  connect
};
