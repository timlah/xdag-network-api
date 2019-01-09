const uuid = require('uuid/v4');

const db = require('../db');
const logger = require('./logger');

function Channel(pgChannel) {
  this.pgChannel = pgChannel;
  this.subscribers = new Map();
  this.batchedMessages = new Map();
  this.batchTimerId = false;

  this.listen();
}

Channel.prototype.listen = async function listen() {
  try {
    this.client = await db.pool.connect();

    if (Array.isArray(this.pgChannel)) {
      this.pgChannel.forEach(channel => {
        this.client.query(`LISTEN ${channel}`);
      });
    } else {
      this.client.query(`LISTEN ${this.pgChannel}`);
    }

    this.client.on('notification', message => {
      if (this.batchedMessages.has(message.channel)) {
        this.batchedMessages.set(
          message.channel,
          this.batchedMessages.get(message.channel).concat(message.payload)
        );
      } else {
        this.batchedMessages.set(message.channel, [message.payload]);
      }

      if (!this.batchTimerId) {
        this.batchTimerId = setTimeout(() => {
          this.sendBatchedMessages();
        }, 2000);
      }
    });
  } catch (err) {
    logger.error(`Channel listen: ${JSON.stringify(err)}`);
  }
};

Channel.prototype.sendBatchedMessages = function sendBatchedMessages() {
  this.batchedMessages.forEach((messages, channel) => {
    logger.debug(
      `channel: ${JSON.stringify(channel)}, 
      messages: ${JSON.stringify(messages)}`
    );

    this.subscribers.forEach(action => {
      action({ channel, messages });
    });
  });

  logger.debug(
    `messages sent: ${JSON.stringify(this.batchedMessages.values())}`
  );

  this.batchTimerId = false;
  this.batchedMessages.clear();
};

Channel.prototype.mute = async function mute() {
  try {
    this.client.release();
  } catch (err) {
    logger.error(`Channel mute: ${JSON.stringify(err)}`);
  }
};

Channel.prototype.subscribe = function subscribe(action) {
  const id = uuid();

  this.subscribers.set(id, action);
  return id;
};

Channel.prototype.unsubscribe = function unsubscribe(subscriber) {
  this.subscribers.delete(subscriber);
};

const statsData = new Channel(['net_stats_upd', 'pool_stats_upd']);

module.exports = {
  statsData
};
