const puppeteer = require('puppeteer');
const props = require('./props.json');

const { Webhooks } = require("@octokit/webhooks");
const webhooks = new Webhooks({
  secret: props['github_secret'],
});

async function updateThread(content) {

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

    await page.evaluate((content) => {

        String.prototype.splice = function(idx, rem, str) {
            return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
        };

        let form = document.querySelector('td>textarea');
        let index = form.value.indexOf('ater[/url]') + 11;
        form.value = form.value.splice(index, 0, "\n"+content);
    }, content);

    await delay(5000);

    let saveButton = await page.$('input[value="Save"]');
    await saveButton.click();

    await delay(10_000);

    page.close();
    browser.close();

}

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

 webhooks.on("*", ({ id, name, payload }) => {
    if(name == 'push') {
        let results = '';
        for(let i = 0; i < payload.commits.length; i++) {
            let commit = payload.commits[i];
            results += payload.repository.name+': [URL="'+commit.url+'"]'+commit.message+'[/URL]';
            if(i != payload.commits.length-1)
                results += '\n';
        }
        updateThread(results);
    }
 });
 
 require("http").createServer(webhooks.middleware).listen(3000);
 // can now receive webhook events at port 3000