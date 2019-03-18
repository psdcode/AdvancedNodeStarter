const util = require('util')
const AWS = require('aws-sdk')
const uuid = require('uuid/v1')
const requireLogin = require('../middlewares/requireLogin')
const keys = require('../config/keys')

const s3 = new AWS.S3({
  accessKeyId: keys.awsAccessKeyId,
  secretAccessKey: keys.awsSecretKey,
})

// s3.getSignedUrl = util.promisify(s3.getSignedUrl)

module.exports = app => {
  app.get('/api/upload', requireLogin, (req, res) => {
    const key = `${req.user.id}/${uuid()}.jpeg`
    s3.getSignedUrl(
      'putObject',
      {
        Bucket: 'test-node-blog-bucket777',
        ContentType: 'image/jpeg',
        Key: key,
      },
      (err, url) => res.send({ key, url })
    )
  })
}
