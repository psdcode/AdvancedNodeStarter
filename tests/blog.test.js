const Page = require('./helpers/page.js')

let page

beforeEach(async () => {
  page = await Page.build()
  await page.goto('http://localhost:3000')
})

afterEach(async () => {
  await page.close()
})

describe('When logged in and on blogs page', () => {
  beforeEach(async () => {
    // Login and redirect to localhost:3000/blogs
    await page.login('blogs')
  })

  test('blog create button is present', async () => {
    // Click button to create new blog post
    const createBlogPostBtnContent = await page.getContentsOfElement(
      'a[href="/blogs/new"] i.material-icons'
    )

    expect(createBlogPostBtnContent).toEqual('add')
  })

  describe('And when click blog create button', () => {
    beforeEach(async () => {
      // Click button to create new blog post
      await page.click('a[href="/blogs/new"]')
    })

    test('can navigate to new blog post form', async () => {
      // Check if form label displayed
      const labelElementSelector = 'form .title label'
      const labelTxt = await page.getContentsOfElement(labelElementSelector)

      expect(labelTxt).toEqual('Blog Title')
    })

    describe('And when using invalid inputs', () => {
      beforeEach(async () => {
        await page.click('form button[type="submit"]')
      })
      test('the form shows an error message', async () => {
        const titleErrorMessage = await page.getContentsOfElement(
          '.title .red-text'
        )
        const contentErrorMessage = await page.getContentsOfElement(
          '.content .red-text'
        )

        expect(titleErrorMessage).toEqual('You must provide a value')
        expect(contentErrorMessage).toEqual('You must provide a value')
      })
    })

    describe('And when using valid inputs', () => {
      const testTitle = 'Test title'
      const testContent = 'Test content'

      beforeEach(async () => {
        await page.type('form .title input', testTitle)
        await page.type('form .content input', testContent)
        await page.click('form button[type="submit"]')
      })
      test('Submitting takes user to review screen', async () => {
        const confirmationMessage = await page.getContentsOfElement('form h5')

        expect(confirmationMessage).toEqual('Please confirm your entries')
      })

      test('Submitting then saving adds blog to index page', async () => {
        await page.click('button.green')
        // Whenever do ajax request, as do by clicking above, need to wait for it to complete
        await page.waitFor('.card')

        const blogPostTitle = await page.getContentsOfElement(
          '.card:last-child .card-content .card-title'
        )
        const blogPostContent = await page.getContentsOfElement(
          '.card:last-child .card-content p'
        )

        expect(blogPostTitle).toEqual(testTitle)
        expect(blogPostContent).toEqual(testContent)
      })
    })
  })
})
