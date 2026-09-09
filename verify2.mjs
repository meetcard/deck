import { chromium } from 'playwright'
const b = await chromium.launch()

// Before: the live site still has the old layout.
const before = await b.newPage({ viewport: { width: 375, height: 800 } })
await before.goto('https://deck.meetcard.io/experience/application/activity/', { waitUntil: 'networkidle' })
console.log('BEFORE (live) h1 top:', await before.evaluate(() => Math.round(document.querySelector('.content h1').getBoundingClientRect().top)))
await before.close()

const p = await b.newPage({ viewport: { width: 375, height: 800 } })
await p.goto('http://localhost:4399/components/molecules/card-index/', { waitUntil: 'networkidle' })
console.log('AFTER  (fix)  h1 top:', await p.evaluate(() => Math.round(document.querySelector('.content h1').getBoundingClientRect().top)))

// Keyboard: the summary is a real control, so Enter must work it.
await p.keyboard.press('Tab'); await p.keyboard.press('Tab')
const focused = await p.evaluate(() => document.activeElement.className)
await p.keyboard.press('Enter')
const opened = await p.evaluate(() => {
  const d = document.querySelector('.catalog')
  const side = document.querySelector('.sidebar')
  return { open: d.open, sidebarH: Math.round(side.getBoundingClientRect().height), scrolls: side.scrollHeight > side.clientHeight }
})
console.log('focus after 2 tabs:', focused)
console.log('after Enter:', JSON.stringify(opened))

// The current page is still marked inside the nav.
console.log('aria-current present:', await p.evaluate(() => !!document.querySelector('.sidebar a[aria-current="page"]')))
await p.close()
await b.close()
