const memory = globalThis.__aap_store || (globalThis.__aap_store = { users: {}, byEmail: {}, byInstance: {}, stripeEvents: {} });
memory.stripeEvents = memory.stripeEvents || {};

function isRedisConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
function assertPersistentStore() {
  if (process.env.NODE_ENV === 'production' && !isRedisConfigured()) {
    throw new Error('Persistent account storage is required in production. Configure Upstash Redis.');
  }
}
async function redis(cmd, args) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify([cmd, ...args]),
  });
  if (!res.ok) throw new Error('Redis ' + res.status);
  const data = await res.json();
  return data.result;
}
async function getUser(id) {
  assertPersistentStore();
  if (isRedisConfigured()) {
    const value = await redis('GET', ['user:' + id]);
    return value ? (typeof value === 'string' ? JSON.parse(value) : value) : null;
  }
  return memory.users[id] || null;
}
async function getUserByEmail(email) {
  assertPersistentStore();
  const key = (email || '').toLowerCase().trim();
  if (isRedisConfigured()) {
    const id = await redis('GET', ['email:' + key]);
    return id ? getUser(id) : null;
  }
  const id = memory.byEmail[key];
  return id ? memory.users[id] : null;
}
async function getUserByInstance(instanceId) {
  assertPersistentStore();
  if (!instanceId) return null;
  if (isRedisConfigured()) {
    const id = await redis('GET', ['instance:' + instanceId]);
    return id ? getUser(id) : null;
  }
  const id = memory.byInstance[instanceId];
  return id ? memory.users[id] : null;
}
async function saveUser(user) {
  assertPersistentStore();
  memory.users[user.id] = user;
  if (user.email) memory.byEmail[user.email.toLowerCase()] = user.id;
  if (user.wixInstanceId) memory.byInstance[user.wixInstanceId] = user.id;
  if (isRedisConfigured()) {
    await redis('SET', ['user:' + user.id, JSON.stringify(user)]);
    if (user.email) await redis('SET', ['email:' + user.email.toLowerCase(), user.id]);
    if (user.wixInstanceId) await redis('SET', ['instance:' + user.wixInstanceId, user.id]);
  }
  return user;
}
async function claimStripeEvent(eventId) {
  if (!eventId) throw new Error('Stripe event ID is required');
  if (isRedisConfigured()) {
    const result = await redis('SET', ['stripe:event:' + eventId, 'processing', 'NX', 'EX', 300]);
    if (result === 'OK') return 'claimed';
    const current = await redis('GET', ['stripe:event:' + eventId]);
    return current === 'processed' ? 'processed' : 'processing';
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Durable Stripe webhook idempotency requires Upstash Redis in production.');
  }
  if (memory.stripeEvents[eventId] === 'processed') return 'processed';
  if (memory.stripeEvents[eventId]) return 'processing';
  memory.stripeEvents[eventId] = 'processing';
  return 'claimed';
}
async function markStripeEventProcessed(eventId) {
  if (isRedisConfigured()) {
    await redis('SET', ['stripe:event:' + eventId, 'processed', 'EX', 2592000]);
  } else {
    memory.stripeEvents[eventId] = 'processed';
  }
}
async function releaseStripeEvent(eventId) {
  if (isRedisConfigured()) {
    await redis('DEL', ['stripe:event:' + eventId]);
  } else {
    delete memory.stripeEvents[eventId];
  }
}
module.exports = {
  getUser, getUserByEmail, getUserByInstance, saveUser,
  isRedisConfigured, claimStripeEvent, markStripeEventProcessed, releaseStripeEvent,
};
