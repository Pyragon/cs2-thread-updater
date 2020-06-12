const puppeteer = require('puppeteer');
const props = require('./props.json');

async function run() {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const cookies = [
        {
            name: 'bb_sessionhash',
            domain: '.rune-server.ee',
            value: props['session_hash']
        },
        {
            name: 'bb_password',
            domain: '.rune-server.ee',
            value: props['password']
        },
        {
            name: 'bb_userid',
            domain: '.rune-server.ee',
            value: props['user_id']
        }
    ]
    await page.setCookie(...cookies);
    await page.goto('https://www.rune-server.ee/runescape-development/rs-503-client-server/projects/693707-open-sourced-cs2script-editor.html');
    
    let editButton = await page.$('a[name="vB::QuickEdit::5696989"]');
    await editButton.click();

    await page.waitForSelector('div#post_message_5696989>form');

    let editForm = await page.$('div#post_message_5696989>form');

    editForm = await editForm.$('td>textarea');

    let text = await page.evaluate(e => e.value, editForm);

    await page.evaluate(() => {

        String.prototype.splice = function(idx, rem, str) {
            return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
        };

        let form = document.querySelector('td>textarea');
        let index = form.value.indexOf('ater[/url]') + 11;
        form.value = form.value.splice(index, 0, "\ntesting auto-thread updater");
    });

    await delay(5000);

    let saveButton = await page.$('input[value="Save"]');
    await saveButton.click();

    await delay(10_000);

    page.close();
    browser.close();
    process.exit();

}

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

run();