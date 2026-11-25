const path = require('path');
const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const { randomUUID } = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws', maxPayload: 16 * 1024 });
const PORT = process.env.PORT || 3000;
const players = new Map();
const COLORS = [0x233b5a,0x49334c,0x31513f,0x59452d,0x344b58,0x573a35];
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req,res) => res.json({ok:true,players:players.size}));

function safeName(v) {
  return String(v || 'Guest').replace(/[<>]/g,'').trim().slice(0,20) || 'Guest';
}
function safeText(v) {
  return String(v || '').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,240);
}
function send(ws, data) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
}
function broadcast(data, except) {
  const raw = JSON.stringify(data);
  for (const [id, p] of players) {
    if (id !== except && p.ws.readyState === WebSocket.OPEN) p.ws.send(raw);
  }
}
function publishCount() {
  const names = [...players.values()].map(p => p.name);
  broadcast({type:'count',count:players.size,names});
}

wss.on('connection', ws => {
  const id = randomUUID();
  const player = {
    id, ws, name:'Guest', color:COLORS[Math.floor(Math.random()*COLORS.length)],
    x:0,z:10,rot:0,state:'idle',lastChat:0,lastState:0
  };
  players.set(id, player);
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  const existing = [...players.values()].filter(p => p.id !== id).map(p => ({
    id:p.id,name:p.name,color:p.color,x:p.x,z:p.z,rot:p.rot,state:p.state
  }));
  send(ws,{type:'welcome',id,players:existing});
  broadcast({type:'joined',player:{id,name:player.name,color:player.color,x:0,z:10,state:'idle'}},id);
  publishCount();

  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (!msg || typeof msg.type !== 'string') return;

    if (msg.type === 'join' || msg.type === 'name') {
      player.name = safeName(msg.name);
      broadcast({type:'state',id,name:player.name,x:player.x,z:player.z,rot:player.rot,state:player.state},id);
      publishCount();
      return;
    }
    if (msg.type === 'state') {
      const now = Date.now();
      if (now - player.lastState < 35) return; // cap state updates
      player.lastState = now;
      const num = v => Number.isFinite(Number(v)) ? Math.max(-35,Math.min(40,Number(v))) : 0;
      player.x = num(msg.x); player.z = num(msg.z);
      player.rot = num(msg.rot); player.state = ['idle','walk','run','sit'].includes(msg.state) ? msg.state : 'idle';
      broadcast({type:'state',id,name:player.name,x:player.x,z:player.z,rot:player.rot,state:player.state},id);
      return;
    }
    if (msg.type === 'chat') {
      const now = Date.now();
      if (now - player.lastChat < 650) return;
      player.lastChat = now;
      const text = safeText(msg.text);
      if (!text) return;
      broadcast({type:'chat',id,name:player.name,text,at:now});
    }
  });

  ws.on('close', () => {
    players.delete(id);
    broadcast({type:'left',id,name:player.name});
    publishCount();
  });
  ws.on('error', () => {});
});

const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false; ws.ping();
  }
}, 30000);
wss.on('close', () => clearInterval(heartbeat));

server.listen(PORT, () => console.log(`SKYFX Metaverse running at http://localhost:${PORT}`));
