const puppeteer = require('puppeteer')
const sessionFactory = require('./factories/sessionFactory')
const userFactory = require('./factories/userFactory')

let browser
let page

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false,
  })
  page = await browser.newPage()
  await page.goto('localhost:3000')
  // jest.setTimeout(30000)
})

test('Header has correct statement', async () => {
  const text = await page.$eval('a.brand-logo', el => el.textContent)
  expect(text).toEqual('Blogster')
})

test('clicking on login starts oauth flow', async () => {
  await page.click('.right a')

  const url = await page.url()
  expect(url).toMatch(/^https:\/\/accounts\.google\.com/)
})

test('When Signed in, shows logout button', async () => {
  const user = await userFactory()
  const { sig, session } = sessionFactory(user)

  await page.setCookie({ name: 'session', value: session })
  await page.setCookie({ name: 'session.sig', value: sig })
  await page.goto('http://localhost:3000')

  const logoutLinkSelector = 'a[href="/auth/logout"]'

  // Wait for age to display link element before proceeding
  await page.waitFor(logoutLinkSelector)

  const logOutLinkText = await page.$eval(
    logoutLinkSelector,
    el => el.textContent
  )

  expect(logOutLinkText).toEqual('Logout')
})

afterEach(async () => {
  await browser.close()
})
