const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const m = require('../model.js');
const csv = require('../conditions.js');

for (const asset of ['index.html', 'style.css', 'i18n.js', 'model.js', 'torque.js', 'app.js', 'conditions.js', 'conditions-template.csv', 'README.html']) {
  assert.ok(fs.statSync(path.join(__dirname, '..', asset)).size > 0, asset);
}

let cases = 0;
for (const voltage of [0, 80, 150, 220])
for (const dpH of [-1, 0, 0.5, 2])
for (const diameter of [0.2, 0.5, 1.2])
for (const radius of [0.1, 0.3, 0.8])
for (const viscosity of [0.5, 1, 5])
for (const target of [25, 50, 90]) {
  const c = { ...m.defaults, voltage, dpH, diameter, radius, viscosity, target };
  const p = m.pmf(c) / 180, z = m.drag(c), f = m.speed(8, p, z);
  assert.ok(Number.isFinite(f) && f >= 0);
  if (p === 0) { assert.equal(f, 0); continue; }
  const settings = m.matched(c), expected = f * target / 100;
  for (const candidate of [
    m.speed(8, p * settings.force, z),
    m.speed(settings.stators, p, z),
    m.speed(8, p, z * settings.load),
  ]) assert.ok(Math.abs(candidate - expected) < 1e-8);
  for (const n of [0.1, 1, 5, 8, 11]) {
    const operating = m.speed(n, p, z);
    assert.ok(Math.abs(m.torque(n, p, operating) - 2 * Math.PI * z * operating) < 1e-7);
  }
  cases++;
}

assert.equal(m.defaults.stochastic, false);
const defaults = m.defaults, matched = m.matched(defaults);
const mean = frames => {
  const selected = frames.filter(frame => frame.t >= 15 && frame.t < 20);
  return selected.reduce((sum, frame) => sum + frame.speed, 0) / selected.length;
};
const target = m.speed(8, m.pmf(defaults) / 180, m.drag(defaults)) * defaults.target / 100;
for (const [i, type] of ['force', 'stators', 'load'].entries()) {
  const run = m.simulate(defaults, matched[type], type, 12345 + i * 11111);
  assert.ok(Math.abs(mean(run.frames) - target) / target < 0.01, type);
  assert.equal(run.frames[0].measured, null);
  assert.notEqual(run.frames[1].measured, null);
  assert.ok(run.frames.every(frame => Number.isFinite(frame.speed) && Number.isFinite(frame.torque)));
}
const random = { ...defaults, stochastic: true, fps: 30 };
const first = m.simulate(random, matched.stators, 'stators', 23456);
const second = m.simulate(random, matched.stators, 'stators', 23456);
assert.equal(first.frames.length, 30 * m.duration + 1);
assert.deepEqual(first.frames.map(frame => frame.n), second.frames.map(frame => frame.n));
assert.ok(first.frames.some(frame => frame.t > 5 && frame.t < 20 && frame.n !== 8));
const noIntervention = {...defaults, interventionEnabled:false, stochastic:false, thermal:false, fps:30};
for(const [i,type] of ['force','stators','load'].entries()){
 const run=m.simulate(noIntervention, matched[type],type,12345+i*11111);
 const baseline=m.speed(8,m.pmf(noIntervention)/180,m.drag(noIntervention));
 assert.ok(run.frames.every(frame=>Math.abs(frame.speed-baseline)<1e-5 && Math.abs(frame.n-8)<1e-5 && Math.abs(frame.pmf-m.pmf(noIntervention))<1e-8));
}
const template=fs.readFileSync(path.join(__dirname,'../conditions-template.csv'),'utf8');
const imported=csv.parse(template);
assert.equal(imported.interventionEnabled,true);
assert.equal(imported.fps,1000);
assert.equal(imported.force,.5);
for(const bad of ['voltage,unknown\n150,1','fps\n29','fps\n30.5','stochastic\nyes','voltage,voltage\n150,150','voltage\n150\n200','voltage\nInfinity']) assert.throws(()=>csv.parse(bad));
console.log(`Passed ${cases} positive-motive-force combinations, three trajectories, and 30 fps seeded sampling.`);
