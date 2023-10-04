import puppeteer from 'puppeteer'

/**
 *
 * @param {number} time
 * @returns {Promise<void>}
 */
const sleep = time => {
  return new Promise(resolve =>
    setTimeout(() => {
      resolve()
    }, time)
  )
}

/**
 *
 * @param {import('puppeteer').Page} page
 * @param {number} time
 * @returns
 */
const delayFn = async (page, time) => {
  await sleep(time)
  const pingTextEle = await page.waitForSelector('#pingText')
  const jitTextEle = await page.waitForSelector('#jitText')

  const pingTextText = await pingTextEle?.evaluate(el => el.textContent)
  const jitTextText = await jitTextEle?.evaluate(el => el.textContent)

  return {
    pingTextText,
    jitTextText,
  }
}

/**
 *
 * @param {import('puppeteer').Page} page
 * @param {number} time
 * @returns
 */
const speedFn = async (page, time) => {
  await sleep(time)

  const downloadSpeedEle = await page.waitForSelector('#dlText')
  const uploadSpeedEle = await page.waitForSelector('#ulText')

  const downloadSpeedText = await downloadSpeedEle?.evaluate(el => el.textContent)
  const uploadSpeedText = await uploadSpeedEle?.evaluate(el => el.textContent)

  return {
    downloadSpeedText,
    uploadSpeedText,
  }
}

{
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/chromium-browser',
  })
  const page = await browser.newPage()

  page.setDefaultTimeout(0)

  await page.goto('https://test.ustc.edu.cn/')

  await page.setViewport({ width: 1080, height: 1024 })

  const res = await delayFn(page, 1000)

  console.log(`网络延迟: ${res.pingTextText} ms, 延迟抖动: ${res.jitTextText} ms.`)
  console.log()

  const speedList = Array.from({ length: 17 }, () => speedFn)

  for (const speed of speedList) {
    const res = await speed(page, 600)

    console.log(`downLoad: ${res.downloadSpeedText} Mbps, upload: ${res.uploadSpeedText} Mbps.`)
  }

  await browser.close()
}
