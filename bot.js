const { Telegraf } = require('telegraf')
require('dotenv').config()
const mongoose = require('mongoose')
const db = require('./database/db')
const users = require('./database/users')
const { nanoid } = require('nanoid')

const bot = new Telegraf(process.env.BOT_TOKEN)

mongoose.connect(`mongodb+srv://${process.env.USER}:${process.env.PASS}@nodetuts.ngo9k.mongodb.net/ohmyNew?retryWrites=true&w=majority`)
    .then(() => {
        console.log('Connected to the database')
    }).catch((err) => {
        console.log(err)
        bot.telegram.sendMessage(741815228, err.message)
    })

bot.start(ctx => {
    let id = ctx.chat.id
    let name = ctx.chat.first_name

    users.findOne({ chatid: id }).then((user) => {
        if (user) {
            console.log(`${id} is already there... not added`)
            sendTheVideo() //send video
        } else {
            users.create({
                chatid: id,
                name,
                unano: `user${id}`,
                points: 10
            }).then(() => {
                sendTheVideo() //send video
                console.log(`${id} added`)
            }).catch((err) => {
                console.log(err)
                bot.telegram.sendMessage(741815228, err.message)
            })
        }
    }).catch((err) => {
        console.log(err)
        bot.telegram.sendMessage(741815228, err.message)
    })

    // akibonyeza start bila payload
    if (!ctx.startPayload) {
        ctx.reply(`Hello, welcome ${ctx.chat.first_name}, to download Full Videos use the links provided on "OH MY" channel under the PREVIEW videos.`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Open OH MY 💋 Channel", url: "https://t.me/joinchat/V6CN2nFJKa1JezKS" }
                    ]
                ]
            }
        })
            .then(() => { console.log('Bot started') }).catch((err) => {
                bot.telegram.sendMessage(741815228, err.message)
                console.log(err)
            })
    }


    //function to send video and deduct points
    // This is hoisting thats why this bottomed function can be called above but if we were to define it with variable we wouldnt be able to call it above
    function sendTheVideo() {
        if (ctx.startPayload) {
            let nano = ctx.startPayload

            users.findOne({ chatid: ctx.chat.id })
                .then((user) => {
                    if (user.points >= 2) {
                        user.updateOne({ points: (user.points - 2) })
                            .then(() => console.log('-2 from ' + user.chatid))
                            .catch((err) => console.log(err))
                        db.findOne({ nano })
                            .then((file) => {
                                bot.telegram.copyMessage(ctx.chat.id, -1001586042518, file.msgId, {
                                }).then(() => {
                                    console.log('msg id ' + file.msgId + ' is copied')
                                    users.findOne({ chatid: ctx.chat.id })
                                        .then((user) => {
                                            setTimeout(() => {
                                                ctx.reply(`You received the video and <b>2 pts.</b> was deducted from your point's balance. \n\n<b>Your remaining points is ${user.points}</b>`, {
                                                    parse_mode: 'HTML',
                                                    reply_markup: {
                                                        inline_keyboard: [
                                                            [
                                                                { text: '🎖 My points', callback_data: 'points' },
                                                                { text: '➕ Add points', url: `www.ohmyw.xyz/boost/${ctx.chat.id}/add` }
                                                            ]
                                                        ]
                                                    }
                                                }).then(() => {
                                                    console.log('Points status sent')
                                                }).catch((err) => {
                                                    console.log(err)
                                                    bot.telegram.sendMessage(741815228, err.message + ' from ' + ctx.chat.id)
                                                })
                                            }, 500)

                                        }).catch((err) => {
                                            console.log(err)
                                            bot.telegram.sendMessage(741815228, err.message + ' from ' + ctx.chat.id)
                                        })
                                }).catch((err) => {
                                    console.log(err)
                                    bot.telegram.sendMessage(741815228, err.message + ' from ' + ctx.chat.id)
                                })
                            }).catch((err) => {
                                console.log(err)
                                bot.telegram.sendMessage(741815228, err.message + ' from ' + ctx.chat.id)
                            })
                    }
                    else if (user.points < 2) {
                        ctx.reply(`You need atleast 2 points to download this video. Click the link below to <b>increase your points for free.</b> \n\n<b>Free boost 👉 http://www.ohmyw.xyz/boost/${ctx.chat.id}/add</b>`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: '🎖 My points', callback_data: 'points' },
                                        { text: '➕ Add points', url: `www.ohmyw.xyz/boost/${ctx.chat.id}/add` }
                                    ],
                                    [{ text: '🚀 Buy here 100 points for $10', callback_data: 'buy' }]
                                ]
                            }
                        })
                    }
                }).catch((err) => {
                    console.log(err)
                    bot.telegram.sendMessage(741815228, err.message + ' from ' + ctx.chat.id)
                })
        }
    }
})

bot.action('points', ctx => {

    users.findOne({ chatid: ctx.chat.id })
        .then((user) => {
            let text = `
${ctx.chat.first_name}

Your remaing points is: ${user.points} pts.

Click  "➕ Add points" button to increase your points
`
            ctx.answerCbQuery(text, {
                show_alert: true
            })

        })
})

bot.action('buy', ctx => {
    let text = `
You are about to buy 100 points for $10.... Payments are accepted in WebMoney and selected cryptocurrencies only (USDT, BUSD & LTC)

<b>Note:</b> <i>Before sending LTC check the conversion rate to make sure you're sending the right amount ($10) - <a href="https://usd.mconvert.net/ltc/10">Click here to check how much is $10 in Litecoin</a></i>

Click the address to copy

1. <b>Webmoney (WMZ) -</b> <code>Z681965649472</code>

2. <b>Litecoin (LTC) -</b> <code>ltc1qjc7g59jqyd5aqm2gyfxp3el23l2j4g9un7vhj5</code>

3. <b>USDT (TRC20) -</b> <code>TXJoNQ9E85XEPp8hhBiESUwhjht7Ucwov6</code>

4. <b>BUSD (BEP20) -</b> <code>0x99E9fe6234D21B4Af506679AE460fe391aEb27b0</code>

After the completion of transaction send the screenshot and your crypto address to @blackberrytz and your points will be increased by 100
    `
    ctx.reply(text, { parse_mode: 'HTML', disable_web_page_preview: true })
})


// admin boost 
bot.command('boost666', ctx => {
    users.findOne({ chatid: ctx.chat.id }).then((user) => {
        user.updateOne({ points: 10 }).then(() => ctx.reply('You boosted'))
    })
})

// boost customer with 100 points
bot.on('text', ctx => {
    let text = ctx.message.text

    if (text.includes('add100-')) {
        let chatid = text.split('-')[1]

        users.findOne({ chatid }).then((user) => {
            user.updateOne({ points: (user.points + 100) }).then(() => ctx.reply('You boosted ' + chatid + ' with 100 points')).catch((err) => {
                console.log(err)
                bot.telegram.sendMessage(741815228, err.message)
            })
        })
    }
})

bot.launch()
    .then((console.log('Bot is running')))
    .catch((err) => {
        console.log('Bot is not running')
        bot.telegram.sendMessage('@shemdoe', err.message + ' bot failed to run')
    })


process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

process.on('unhandledRejection', (reason, promise) => {
    bot.telegram.sendMessage(1473393723, reason + ' It is an unhandled rejection.')
    console.log(reason)
    process.exit(0)
    //on production here process will change from crash to start cools
})

//caught any exception
process.on('uncaughtException', (err) => {
    console.log(err.message)
    bot.telegram.sendMessage(741815228, err.message + ' - It is ana uncaught exception.')
})