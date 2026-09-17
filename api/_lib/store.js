const memory = globalThis.__aap_store || (globalThis.__aap_store = { users: {}, byEmail: {}, byInstance: {} });
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
  const r = await redis('GET', ['user:' + id]);
  if (r !== null && r !== undefined) return typeof r === 'string' ? JSON.parse(r) : r;
  return memory.users[id] || null;
}
async function getUserByEmail(email) {
  const key = (email || '').toLowerCase().trim();
  const id = await redis('GET', ['email:' + key]);
  if (id) return getUser(id);
  const mid = memory.byEmail[key];
  return mid ? memory.users[mid] : null;
}
async function getUserByInstance(instanceId) {
  if (!instanceId) return null;
  const id = await redis('GET', ['instance:' + instanceId]);
  if (id) return getUser(id);
  const mid = memory.byInstance[instanceId];
  return mid ? memory.users[mid] : null;
}
async function saveUser(user) {
  memory.users[user.id] = user;
  if (user.email) memory.byEmail[user.email.toLowerCase()] = user.id;
  if (user.wixInstanceId) memory.byInstance[user.wixInstanceId] = user.id;
  await redis('SET', ['user:' + user.id, JSON.stringify(user)]);
  if (user.email) await redis('SET', ['email:' + user.email.toLowerCase(), user.id]);
  if (user.wixInstanceId) await redis('SET', ['instance:' + user.wixInstanceId, user.id]);
  return user;
}
module.exports = { getUser, getUserByEmail, getUserByInstance, saveUser };
