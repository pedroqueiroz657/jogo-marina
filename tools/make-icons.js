// Gera os ícones PNG do app a partir do sprite em pixel art da Marina.
// Uso: node tools/make-icons.js
const fs = require('fs'), path = require('path'), zlib = require('zlib'), vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { document: { createElement: () => ({ getContext: () => ({}) }) } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/sprites.js'), 'utf8') + ';this.marinaDownHD=marinaDownHD;', ctx);

// "contexto" falso que grava pixels num buffer 32x48
const SW = 32, SH = 48;
const spr = new Array(SW * SH).fill(null);
const g = { fillStyle: '#000', fillRect(x, y, w, h) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && j >= 0 && i < SW && j < SH) spr[j * SW + i] = this.fillStyle; } };
ctx.marinaDownHD(g, 0);

const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
function crc32(buf) { let c, crc = ~0; for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 255; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return ~crc >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); }

function makeIcon(size, file) {
  const px = Buffer.alloc(size * size * 3);
  const scale = Math.max(1, Math.floor(size * 0.8 / SH));
  const ox = Math.floor((size - SW * scale) / 2), oy = Math.floor((size - SH * scale) / 2) + Math.floor(size * 0.03);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    // fundo: céu amarelo do sertão -> verde
    const t = y / size;
    let c = [Math.round(246 - 200 * t * t), Math.round(206 - 80 * t * t), Math.round(90 - 20 * t)];
    const d = Math.hypot(x - size / 2, y - size * 0.42) / size;
    if (d < 0.36) c = [242, 194, 48]; // sol
    if (y > size * 0.8) c = [201, 168, 106]; // chão
    const sx = Math.floor((x - ox) / scale), sy = Math.floor((y - oy) / scale);
    if (sx >= 0 && sy >= 0 && sx < SW && sy < SH && spr[sy * SW + sx]) c = hex(spr[sy * SW + sx]);
    px.set(c, (y * size + x) * 3);
  }
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) { raw[y * (size * 3 + 1)] = 0; px.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2;
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
  fs.mkdirSync(path.join(root, 'icons'), { recursive: true });
  fs.writeFileSync(path.join(root, 'icons', file), png);
  console.log('ok', file);
}
makeIcon(180, 'apple-touch-icon.png');
makeIcon(192, 'icon-192.png');
makeIcon(512, 'icon-512.png');
