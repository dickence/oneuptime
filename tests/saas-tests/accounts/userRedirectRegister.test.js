const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');
const axios = require('axios');

let page, browser;

// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';

describe('Home redirect', () => {
    beforeAll(async done => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);
        await page.goto(
            `${utils.HOME_URL}?utm_source=runningtest&good=thankyou&kill=love&ion=pure`,
            { waitUntil: 'networkidle2' }
        );
        await page.goto(`${utils.ACCOUNTS_URL}/accounts/register`, {
            waitUntil: 'networkidle2',
        });
        // Register user
        const user = {
            email,
            password,
        };
        // user
        await init.registerUser(user, page);
        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'redirected query string should be save as source in the user schema',
        async () => {
            const data = {
                collection: 'users',
                query: { email: email },
            };
            const config = {
                method: 'post',
                url: utils.INIT_SCRIPT_URL + '/find',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: data,
            };
            const res = await axios(config);
            expect(res.data[0].source).not.toEqual(null);
        },
        init.timeout
    );
});
