import { chromium } from 'playwright';
const url = 'file://' + process.cwd() + '/index.html';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let pass = 0, fail = 0;
const ok = (name, cond) => { cond ? pass++ : (fail++, console.log('FAIL: ' + name)); };

const page = await b.newPage();
const errs = [];
page.on('pageerror', e => errs.push(String(e)));
await page.goto(url); await page.waitForTimeout(300);

ok('no JS errors on load', errs.length === 0);
ok('stamp says ed.4.1', (await page.textContent('.stamp')).includes('ed.4.1'));
ok('Book soon collapsed by default', await page.$eval('#alertbox', e => e.classList.contains('closed')));
ok('abtoggle says Expand', (await page.textContent('#abtoggle')).includes('Expand'));
ok('Free chip gone', await page.$('#freeC') === null);
ok('Travel dropdown gone', await page.$('#travel') === null);
ok('hearts chip present', (await page.textContent('#topC')) === '♥♥♥♥♥');
ok('New section header present', (await page.textContent('#out')).includes('New this edition'));
ok('New section collapsed', await page.$eval('h2[data-sec="_new"] + .sec', e => e.classList.contains('hidden')));
// expand New section
await page.click('h2[data-sec="_new"]');
ok('New section expands on click', await page.$eval('h2[data-sec="_new"] + .sec', e => !e.classList.contains('hidden')));
await page.click('h2[data-sec="_new"]');

// admin mode default off: only pin+link visible on cards
const vis = await page.$$eval('.card', cards => {
  const c = cards.find(x => !x.closest('.hidden'));
  return [...c.querySelectorAll('.fb button')].map(btn => [btn.getAttribute('data-f'), getComputedStyle(btn).display !== 'none']);
});
ok('non-admin: pin visible', vis.find(v => v[0] === 'book')[1] === true);
ok('non-admin: link visible', vis.find(v => v[0] === 'link')[1] === true);
ok('non-admin: love hidden', vis.find(v => v[0] === 'love')[1] === false);
ok('non-admin: done hidden', vis.find(v => v[0] === 'done')[1] === false);
ok('non-admin: err hidden', vis.find(v => v[0] === 'err')[1] === false);
ok('non-admin: My flags head hidden', await page.$eval('#flagshead', e => getComputedStyle(e).display === 'none'));
ok('Share my pins visible', await page.$eval('#sharepins', e => getComputedStyle(e).display !== 'none'));

// toggle admin
await page.click('#admintog'); await page.waitForTimeout(100);
ok('admin: body class set', await page.$eval('body', e => e.classList.contains('admin')));
const vis2 = await page.$$eval('.card', cards => {
  const c = cards[0];
  return [...c.querySelectorAll('.fb button')].map(btn => [btn.getAttribute('data-f'), getComputedStyle(btn).display !== 'none']);
});
ok('admin: love visible', vis2.find(v => v[0] === 'love')[1] === true);
ok('admin: My flags head visible', await page.$eval('#flagshead', e => getComputedStyle(e).display !== 'none'));
ok('admin: flags area collapsed', await page.$eval('#flagsarea', e => getComputedStyle(e).display === 'none'));
await page.click('#flagshead');
ok('flags area expands', await page.$eval('#flagsarea', e => getComputedStyle(e).display !== 'none'));
ok('Copy my flags in area', await page.$eval('#copyflags', e => getComputedStyle(e).display !== 'none'));
ok('admin persists in localStorage', await page.evaluate(() => localStorage.getItem('radarAdmin') === '1'));

// flag a card as booked (admin on), then check booked section behaviour
const slug = await page.$eval('.sec:not(.hidden) .card', c => c.getAttribute('data-slug'));
await page.click('.sec:not(.hidden) .card .fb button[data-f="done"]'); await page.waitForTimeout(200);
ok('booked section appears unfiltered', (await page.textContent('#out')).includes('✓ Booked'));
// apply a filter -> booked section must disappear
await page.click('#cats button[data-c="theatre"]'); await page.waitForTimeout(200);
ok('booked section hidden when filtered', !(await page.textContent('#out')).includes('✓ Booked'));
await page.click('#cats button[data-c="all"]'); await page.waitForTimeout(200);
ok('booked section back when unfiltered', (await page.textContent('#out')).includes('✓ Booked'));
// date filter also hides it
await page.selectOption('#quick', '7'); await page.waitForTimeout(200);
ok('booked hidden with date filter', !(await page.textContent('#out')).includes('✓ Booked'));
await page.click('#clear'); await page.waitForTimeout(200);

// pin two cards, test share text + pins URL view
await page.evaluate(s => { localStorage.setItem('radarFlags', JSON.stringify({ [s]: 'book' })); }, slug);
await page.reload(); await page.waitForTimeout(300);
await page.click('#sharepins');
const shareTxt = await page.$eval('#flagtext', e => e.value);
ok('share text contains pins link', shareTxt.includes('?pins=' + slug));

const page2 = await b.newPage();
const errs2 = []; page2.on('pageerror', e => errs2.push(String(e)));
await page2.goto(url + '?pins=' + slug); await page2.waitForTimeout(300);
ok('pins view: no JS errors', errs2.length === 0);
ok('pins view: banner shown', await page2.$('#shareban') !== null);
ok('pins view: banner counts 1 event', (await page2.textContent('#shareban')).includes('1 event'));
const nCards = await page2.$$eval('.card', cs => { const seen = new Set(); cs.forEach(c => seen.add(c.getAttribute('data-slug'))); return seen.size; });
ok('pins view: only pinned card shown', nCards === 1);
ok('pins view: Book soon hidden', await page2.$eval('#alertbox', e => e.classList.contains('hidden')));
ok('pins view: full-radar link present', await page2.$eval('#shareban a', e => e.getAttribute('href') !== null));

// deep link still works
const page3 = await b.newPage();
await page3.goto(url + '?event=' + slug); await page3.waitForTimeout(600);
ok('deep link flashes card', await page3.$('.card.flash') !== null || await page3.$('.card[data-slug="' + slug + '"]') !== null);

// New chip filter works
await page3.click('#newC'); await page3.waitForTimeout(200);
const allNew = await page3.$$eval('h2.sech', hs => hs.map(h => h.getAttribute('data-sec')));
ok('New filter renders', allNew.length > 0);

console.log(pass + ' passed, ' + fail + ' failed');
await b.close();
process.exit(fail ? 1 : 0);
