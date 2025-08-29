require('dotenv').config();

const { Client, GatewayIntentBits, Events } = require('discord.js');
// Node 18+ has global fetch; if you're on older Node:  const fetch = (...a) => import('node-fetch').then(({default:f}) => f(...a));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const API = (process.env.JOKE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

// helper to fetch JSON with basic error handling
async function getJSON(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

const api = {
  random: async () => {
  const res = await fetch(`${API}/joke`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  // try JSON first, fall back to text
  let d;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    d = await res.json();
    return d.joke ?? d.text ?? 'no joke found';
  } else {
    const t = await res.text();
    return t || 'no joke found';
  }
},


  add: async (text) => {
    await getJSON(`${API}/addjoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ joke: text }),
    });
  },

  dump: async () => {
  const res = await fetch(`${API}/jokes`);
  if (res.status === 404) return []; // no dump endpoint yet
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const d = await res.json();
  const arr = Array.isArray(d) ? d : d.jokes || [];
  return arr.map(x => (typeof x === 'string' ? x : x.joke)).filter(Boolean);
},

};

client.once(Events.ClientReady, c => console.log(`Logged in as ${c.user.tag}`));

client.on(Events.InteractionCreate, async (i) => {
  if (!i.isChatInputCommand()) return;

  try {
    if (i.commandName === 'joke') {
      await i.deferReply();
      const j = await api.random();
      await i.editReply(j);
    } else if (i.commandName === 'addjoke') {
      const text = i.options.getString('text', true);
      await i.deferReply({ ephemeral: true });
      await api.add(text);
      await i.editReply('joke added');
    } else if (i.commandName === 'jokedump') {
      await i.deferReply({ ephemeral: true });
      const list = await api.dump();
      if (!list.length) return i.editReply('no jokes stored');

      const joined = list.map((j, idx) => `${idx + 1}. ${j}`).join('\n');
      const msg = joined.length > 1900 ? joined.slice(0, 1900) + '\n...(truncated)' : joined;
      await i.editReply(msg);
    }
  } catch (err) {
    console.error(err);
    const msg = 'error talking to api';
    if (i.deferred || i.replied) await i.editReply(msg);
    else await i.reply({ content: msg, ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);
