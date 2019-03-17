const Page = require('./helpers/page')

let page

beforeEach(async () => {
  const isHeadless = true
  page = await Page.build(isHeadless)
  await page.goto('http://localhost:3000')
})

test('Header has correct statement', async () => {
  const text = await page.getContentsOfElement('a.brand-logo')
  expect(text).toEqual('Blogster')
})

test('Clicking on login starts oauth flow', async () => {
  await page.click('.right a')

  const url = await page.url()
  expect(url).toMatch(/^https:\/\/accounts\.google\.com/)
})

test('When Signed in, shows logout button', async () => {
  await page.login()

  const logoutLinkSelector = 'a[href="/auth/logout"]'
  const logOutLinkText = await page.getContentsOfElement(logoutLinkSelector)

  expect(logOutLinkText).toEqual('Logout')
})

afterEach(async () => {
  await page.close()
})
