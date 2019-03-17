const puppeteer = require('puppeteer')
const sessionFactory = require('../factories/sessionFactory')
const userFactory = require('../factories/userFactory')

class CustomPage {
  static async build(isHeadless) {
    const browser = await puppeteer.launch({
      headless: isHeadless,
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
    // Since executed ajax call above, wait for age to display link element before proceeding
    await this.page.waitFor(logoutLinkSelector)

    if (goToPagePath) {
      await this.page.goto(`http://localhost:3000/${goToPagePath}`)
      // Since executed ajax call above, wait for age to display link element before proceeding
      await this.page.waitFor(logoutLinkSelector)
    }
  }

  async getContentsOfElement(selector) {
    return this.page.$eval(selector, el => el.innerHTML)
  }

  get(path) {
    // Parameters are not included in the closure of the function passed to page.evaluate since it gets executed in a different context. Pass them as additional arguments to page.evaluate
    return this.page.evaluate(_path => {
      return fetch(_path, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(resp => resp.json())
    }, path)
  }

  post(path, data) {
    // Parameters are not included in the closure of the function passed to page.evaluate since it gets executed in a different context. Pass them as additional arguments to page.evaluate
    return this.page.evaluate(
      (_path, _data) => {
        return fetch(_path, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(_data),
        }).then(resp => resp.json())
      },
      path,
      data
    )
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => this[method](path, data))
    )
  }
}

module.exports = CustomPage
