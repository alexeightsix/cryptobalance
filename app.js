const axios = require('axios');
const moment = require('moment');
const config = require('./config.js');
const mailgun = require('mailgun-js')(config.mailgun);

const app = {
    async getCrypto(cryptocurrency) {
        let data = false;
        await axios.get('https://min-api.cryptocompare.com/data/price?fsym='+cryptocurrency+'&tsyms=CAD').then((response) => {
            data = response.data['CAD'];
        });
        return data;
    },
    async getTotal() {
        const coins = config.portfolio;
        const totals = [];

        for (var key in coins) {
           await this.getCrypto(key).then((price) => {
            totals.push(coins[key] * price);
            });
        }

        return(totals.reduce((acc, val) => {
            return acc + val;
        }));
    },
    async sendEmail(email) {
        this.getTotal().then((total) => {
            mailgun.messages().send({
                from: config.email.from+' <'+config.email.from+'>',
                to: email,
                subject: config.email.subject.replace('%date%', moment().format('MMMM Do YYYY, h:mm:ss a')),
                text: config.email.body.replace('%balance%', '$'+total.toFixed(2))
            });
        });
    }
};

app.sendEmail(config.email.to);