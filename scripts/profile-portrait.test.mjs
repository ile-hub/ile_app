import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const ids = {
  amina: '33144328-594b-4c09-9eeb-2913c2c39b0f', david: 'bbc84e2a-5e68-47d7-8ce2-69b218d3d550',
  sarah: 'b47ba3cc-7aa1-439a-9df6-b1e68fc92457', jamie: '5271e678-d8ee-4f23-81b7-29e1dd9b0b3c',
  priya: '835b4e68-5ad7-4069-ad56-e15b6cf4a063', lewis: '56fa85f3-eb9b-4203-a763-2a7863569f36',
};
function compile(file) { return ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
  fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText; }
function resolver(dev) {
  const exports = {}, assets = [];
  vm.runInNewContext(compile('../src/lib/profilePortrait.ts'), { exports, __DEV__: dev, URL, require(path) {
    assert.match(path, /^\.\.\/\.\.\/assets\/demo\/portraits\/(amina|david|sarah|jamie|priya|lewis)\.png$/);
    assets.push(path); return assets.length;
  } });
  return { resolve: exports.resolveProfilePortrait, assets };
}
test('six exact demo IDs resolve only to their corresponding approved assets without changing profiles', () => {
  const h = resolver(true);
  assert.equal(h.assets.length, 6);
  for (const [name, id] of Object.entries(ids)) {
    const profile = Object.freeze({ id, photoUrl: null, displayName: 'Renamed account', verification: { identityStatus: 'unverified' } });
    const portrait = h.resolve(profile);
    assert.equal(portrait.demoOnly, true);
    assert.ok(h.assets[portrait.source - 1].endsWith(`/${name}.png`));
    assert.equal(profile.photoUrl, null);
    assert.equal(profile.verification.identityStatus, 'unverified');
  }
});
test('names, roles, historical IDs and inherited object keys cannot select a demo portrait', () => {
  const h = resolver(true);
  for (const id of ['historical-account', 'constructor', 'toString', '__proto__', ids.amina.toUpperCase(), ' ' + ids.amina]) {
    assert.equal(h.resolve({ id, photoUrl: null, displayName: 'Amina', role: 'landlord', demo: true }), null);
  }
  assert.equal(h.resolve(null), null);
});
test('valid HTTPS wins; absent, malformed, credential-bearing or failed demo remote images fall back', () => {
  const h = resolver(true), id = ids.amina, url = 'https://images.example.test/portrait.png';
  assert.equal(h.resolve({ id, photoUrl: url }).source.uri, url);
  assert.equal(h.resolve({ id, photoUrl: url }).demoOnly, false);
  assert.equal(h.resolve({ id, photoUrl: url }, url).demoOnly, true);
  for (const photoUrl of [null, '', 'not a url', 'file:///photo.png', 'http://localhost/photo.png', 'https://user:password@example.test/photo.png']) {
    assert.equal(h.resolve({ id, photoUrl }).demoOnly, true);
  }
});
test('other users retain remote URLs and initials on failure; production never loads or uses demo assets', () => {
  for (const dev of [true, false]) {
    const h = resolver(dev), url = 'https://images.example.test/real.png';
    assert.equal(h.resolve({ id: 'historical', photoUrl: url }).source.uri, url);
    assert.equal(h.resolve({ id: 'historical', photoUrl: url }, url), null);
    assert.equal(h.resolve({ id: 'historical', photoUrl: 'http://existing-path' }).source.uri, 'http://existing-path');
    if (!dev) {
      assert.deepEqual(h.assets, []);
      for (const id of Object.values(ids)) {
        assert.equal(h.resolve({ id, photoUrl: null }), null);
        assert.equal(h.resolve({ id, photoUrl: url }).source.uri, url);
        assert.equal(h.resolve({ id, photoUrl: url }, url), null);
      }
    }
  }
});
test('portrait renderer labels fictional assets, falls back after image errors and drops stale errors on identity changes', () => {
  const h = resolver(true); let failed = null;
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  vm.runInNewContext(compile('../src/components/ProfilePortrait.tsx'), { exports, require(name) {
    if (name === 'react') return { useState: () => [failed, value => { failed = value; }] };
    if (name === 'react/jsx-runtime') return { jsx };
    if (name === 'react-native') return { Image: 'Image' };
    if (name.endsWith('/profilePortrait')) return { resolveProfilePortrait: h.resolve };
    throw Error(name);
  } });
  const render = profile => exports.ProfilePortrait({ profile, style: {}, accessibilityLabel: 'Profile photo', fallback: 'initial' });
  const demo = render({ id: ids.amina, photoUrl: null });
  assert.match(demo.props.accessibilityLabel, /fictional demo portrait/);
  assert.doesNotMatch(demo.props.accessibilityLabel, /verified/i);
  const url = 'https://images.example.test/shared.png', profile = { id: ids.amina, photoUrl: url };
  render(profile).props.onError(); assert.equal(typeof render(profile).props.source, 'number');
  assert.equal(render({ id: ids.david, photoUrl: url }).props.source.uri, url, 'A different identity must try its remote image');
  const historical = { id: 'old-test', photoUrl: url };
  render(historical).props.onError(); assert.equal(render(historical), 'initial');
});
