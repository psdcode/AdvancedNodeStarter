const puppeteer = require('puppeteer')
const sessionFactory = require('../factories/sessionFactory')
const userFactory = require('../factories/userFactory')

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false,
    })

    const page = await browser.newPage()
    const customPage = new CustomPage(page)

    return new Proxy(customPage, {
      get(target, property) {
        return target[property] || browser[property] || target.page[property]
      },
    })
  }

  constructor(page) {
    this.page = page
  }

  async login(goToPagePath) {
    const user = await userFactory()
    const { sig, session } = sessionFactory(user)
    const logoutLinkSelector = 'a[href="/auth/logout"]'

    await this.page.setCookie({ name: 'session', value: session })
    await this.page.setCookie({ name: 'session.sig', value: sig })
    await this.page.goto('http://localhost:3000')
    await this.page.waitFor(logoutLinkSelector)

    if (goToPagePath) {
      await this.page.goto(`http://localhost:3000/${goToPagePath}`)
    }
  }

  async getContentsOfElement(selector) {
    return this.page.$eval(selector, el => el.innerHTML)
  }
}

module.exports = CustomPage
