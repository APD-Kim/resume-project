import axios from "axios"
export const apiTimeCheck = (req, res, next) => {
  const start = new Date()
  console.time('api')
  next()
  res.on('finish', () => {
    const end = new Date();
    console.log('api end =>', (end - start) / 1000);
    if (end - start >= 3000) {
      const requestUrl = req.originalUrl;
      const token = req.cookies.authorization
      axios.post(
        'https://hooks.slack.com/services/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',
        { "text": `url: ${requestUrl}\nTOKEN : ${token}\napi가 너무 느려요!!! >${end - start}ms가 걸렸어요` })
    }
  })
}