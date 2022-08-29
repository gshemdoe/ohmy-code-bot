const { Telegraf } = require('telegraf')
require('dotenv').config()
const mongoose = require('mongoose')
const db = require('./database/db')
const users = require('./database/users')
const { nanoid } = require('nanoid')
const offer = require('./database/offers')

const bot = new Telegraf(process.env.BOT_TOKEN)

mongoose.connect(`mongodb+srv://${process.env.USER}:${process.env.PASS}@nodetuts.ngo9k.mongodb.net/ohmyNew?retryWrites=true&w=majority`)
    .then(() => {
        console.log('Connected to the database')
    }).catch((err) => {
        console.log(err)
        bot.telegram.sendMessage(741815228, err.message)
    })

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

const important = {
    replyDb: -1001608248942,
    pzone: -1001352114412,
    prem_channel: -1001470139866,
    local_domain: 't.me/rss_shemdoe_bot?start=',
    prod_domain: 't.me/ohmychannelV2bot?start=',
    shemdoe: 741815228
}

function errMessage(err, id) {
    if (err.message && err.description) {
        console.log(err)
        bot.telegram.sendMessage(741815228, err.message + ' from ' + id)
    }
    else if (err.message && !err.description) {
        console.log(err)
        bot.telegram.sendMessage(741815228, err.message + ' from ' + id)
    } else if (!err.message && err.description) {
        console.log(err)
        bot.telegram.sendMessage(741815228, err.description + ' from ' + id)
    }
}



bot.start(async ctx => {
    let id = ctx.chat.id
    let name = ctx.chat.first_name

    try {
        if (ctx.startPayload) {
            let nano = ctx.startPayload

            let title = await db.findOne({ nano })
            ctx.reply(`<b>${title.caption}</b> \n\nHow would you like to download this video?`, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '⬇ WITH POINTS (no link)', callback_data: `paid-${nano}` }],
                        [{ text: '🆓 WITH NO POINTS (link)', callback_data: `free-${nano}` }]
                    ]
                }
            })
        }

        if (!ctx.startPayload) {
            await ctx.reply(`Hello, welcome ${ctx.chat.first_name}, to download Full Videos use the links provided on "OH MY" channel under the PREVIEW videos.`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Open OH MY 💋 Channel", url: "https://t.me/joinchat/V6CN2nFJKa1JezKS" }
                        ]
                    ]
                }
            })
        }
    } catch (err) {
        errMessage(err, id)
    }
})


bot.command('offer', async ctx => {
    try {
        let txt = ctx.message.text
        let durl = txt.split('/offer-')[1]

        await offer.updateOne({}, { url: durl, stats: 0 }, { upsert: true })
        ctx.reply('Offer posted successfully')
    } catch (err) {
        errMessage(err, ctx.chat.id)
    }
})


bot.command('add', async ctx => {
    let txt = ctx.message.text

    try {
        let arr = txt.split('-')
        let id = Number(arr[1])
        let pts = Number(arr[2])

        let updt = await users.findOneAndUpdate({ chatid: id }, { $inc: { points: pts } }, { new: true })
        await bot.telegram.sendMessage(id, `Congratulations 🎉 \nYour payment is confirmed! You received ${pts} points. Your new payment balance is ${updt.points} points`)
    } catch (err) {
        errMessage(err, ctx.chat.id)
    }
})

bot.on('channel_post', async ctx => {
    if (ctx.channelPost.chat.id == important.replyDb) {
        if (ctx.channelPost.reply_to_message) {
            let rpId = ctx.channelPost.reply_to_message.message_id
            let cdata = ctx.channelPost.text

            await bot.telegram.copyMessage(important.prem_channel, important.replyDb, rpId, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '⬇ DOWNLOAD FULL VIDEO', callback_data: `getFull-${cdata}` }
                        ]
                    ]
                }
            }).catch(err => errMessage(err, ctx.chat.id))
        }
    }
})

bot.action('points', async ctx => {
    try {
        let user = await users.findOne({ chatid: ctx.chat.id })
        let text = `${ctx.chat.first_name} \n\nYour remaing points is: ${user.points} pts. \n\nClick  "➕ Add More" button to add your points.
`
        ctx.answerCbQuery(text, {
            show_alert: true
        })
    } catch (err) {
        errMessage(err, ctx.chat.id)
    }
})

bot.action('add_more', async ctx => {
    try {
        let chatid = ctx.chat.id
        let name = ctx.chat.first_name
        let id_to_delete = ctx.callbackQuery.message.message_id

        await ctx.reply(`Hello ${name}, buy more points from below packages.`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '» Get 100 points for $1.0', callback_data: 'inst' }],
                    [{ text: '» Get 200 points for $1.5', callback_data: 'inst' }],
                    [{ text: '» Get 400 points for $2.5', callback_data: 'inst' }],
                    [{ text: '» Get 1000 points for $5.0', callback_data: 'inst' }]
                ]
            }
        })
        await bot.telegram.deleteMessage(chatid, id_to_delete)
    } catch (err) {
        errMessage(err, ctx.chat.id)
    }

})

bot.action('usdt', async ctx => {
    await bot.telegram.copyMessage(ctx.chat.id, -1001586042518, 2618)
        .catch(err => errMessage(err, ctx.chat.id))
})

bot.action('ltc', async ctx => {
    await bot.telegram.copyMessage(ctx.chat.id, -1001586042518, 2619)
        .catch(err => errMessage(err, ctx.chat.id))
})

bot.action('busd', async ctx => {
    await bot.telegram.copyMessage(ctx.chat.id, -1001586042518, 2620)
        .catch(err => errMessage(err, ctx.chat.id))
})

bot.action('doge', async ctx => {
    await bot.telegram.copyMessage(ctx.chat.id, -1001586042518, 2621)
        .catch(err => errMessage(err, ctx.chat.id))
})

bot.action('personal', async ctx => {
    await bot.telegram.copyMessage(ctx.chat.id, -1001586042518, 2622)
        .catch(err => errMessage(err, ctx.chat.id))
})

bot.action('inst', async ctx => {
    let chatid = ctx.chat.id
    let msg_to_delete = ctx.callbackQuery.message.message_id
    try {
        await bot.telegram.copyMessage(ctx.chat.id, -1001586042518, 2609, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '› USDT', callback_data: 'usdt' },
                        { text: '› BUSD', callback_data: 'busd' },
                    ],
                    [
                        { text: '› LTC', callback_data: 'ltc' },
                        { text: '› DOGE', callback_data: 'doge' },
                    ],
                    [
                        { text: `I need a personal help 😢`, callback_data: 'personal' }
                    ]
                ]
            }
        })
        await bot.telegram.deleteMessage(chatid, msg_to_delete)
    } catch (err) {
        errMessage(err, ctx.chat.id)
    }
})

bot.on('callback_query', async ctx => {
    try {
        let cdata = ctx.callbackQuery.data
        let callId = ctx.callbackQuery.id
        if (cdata.includes('getFull-')) {
            let nano = cdata.split('getFull-')[1]

            ctx.answerCbQuery('', {
                url: important.prod_domain + nano,
                cache_time: 600
            })
        }
        else if (cdata.includes('paid-')) {
            let nano = cdata.split('paid-')[1]
            let id = ctx.chat.id
            let mid = ctx.callbackQuery.message.message_id
            let name = ctx.chat.first_name

            let thisUser = await users.findOne({ chatid: id })
            if (!thisUser) {
                await users.create({ chatid: id, name, unano: `user${id}`, points: 10 })
                console.log('New user Added')
                await ctx.reply(`Hello ${name}, welcome onboarding, this is OH! MY Booster Bot, You'll be using me for getting premium shows, every show I send you will cost you 2 points, as you're newbie I gave you 10 free points.`)
            }

            let user = await users.findOne({ chatid: id })
            if (user.points >= 2) {
                await user.updateOne({ $inc: { points: -2 } })
                let vid = await db.findOne({ nano })
                await bot.telegram.copyMessage(id, -1001586042518, vid.msgId)
                await bot.telegram.deleteMessage(id, mid)
                setTimeout(() => {
                    ctx.reply(`You got the file and 2 points deducted from your points balance. \n\n<b>You remain with ${user.points - 2} points.</b>`, {
                        parse_mode: 'HTMl',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '➕ Add more', callback_data: 'add_more' },
                                    { text: '💰 Balance', callback_data: 'points' }
                                ]
                            ]
                        }
                    })
                }, 1000)

            } else if (user.points < 2) {
                await ctx.reply(`Hey <b>${ctx.chat.first_name}</b>, You don't have enough points to get the video. Add more points by donating a small amount. Choose below.`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '» Get 100 points for $1.0', callback_data: 'inst' }],
                            [{ text: '» Get 200 points for $1.5', callback_data: 'inst' }],
                            [{ text: '» Get 400 points for $2.5', callback_data: 'inst' }],
                            [{ text: '» Get 1000 points for $5.0', callback_data: 'inst' }]
                        ]
                    }
                })
            }
        }

        else if (cdata.includes('free-')) {
            let msgid = ctx.callbackQuery.message.message_id
            let nano = cdata.split('free-')[1]
            let vid = await db.findOne({ nano })
            await bot.telegram.deleteMessage(ctx.chat.id, msgid)
            let our_link = await ctx.reply(`Open the link below, stay on the site for 10 seconds and I'll inbox you the full video.`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '⬇ OPEN TO GET FULL VIDEO NOW', url: `www.tele-offers.online/open-offer/complete/${nano}/${ctx.chat.id}/${vid.msgId}` }]
                    ]
                }
            })
            setTimeout(()=> {
                bot.telegram.deleteMessage(ctx.chat.id, our_link.message_id)
            }, 60000)
        }
    } catch (err) {
        errMessage(err, ctx.chat.id)
    }
})


bot.launch()
    .then((console.log('Bot is running')))
    .catch((err) => {
        console.log('Bot is not running')
        bot.telegram.sendMessage(important.shemdoe, err.message)
    })


process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

process.on('unhandledRejection', (reason, promise) => {
    bot.telegram.sendMessage(important.shemdoe, reason + ' It is an unhandled rejection.')
    console.log(reason)
    //on production here process will change from crash to start cools
})

//caught any exception
process.on('uncaughtException', (err) => {
    console.log(err)
    bot.telegram.sendMessage(741815228, err.message + ' - It is ana uncaught exception.')
})