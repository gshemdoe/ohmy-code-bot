const { Telegraf } = require('telegraf')
require('dotenv').config()
const mongoose = require('mongoose')
const db = require('./database/db')
const users = require('./database/users')
const { nanoid } = require('nanoid')
const offer = require('./database/offers')
const gifsModel = require('./database/gif')
const reqModel = require('./database/requestersDb')

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
    shemdoe: 741815228,
    halot: 1473393723,
    xzone: -1001740624527,
    ohmyDB: -1001586042518
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
        let thisUser = await users.findOne({ chatid: id })
        if (!thisUser) {
            await users.create({ chatid: id, name, unano: `user${id}`, points: 10 })
            console.log('New user Added')
        }

        if (ctx.startPayload) {
            let nano = ctx.startPayload

            if (nano.includes('fromWeb-')) {
                let webNano = nano.split('fromWeb-')[1]
                let vid = await db.findOne({ nano: webNano })
                await bot.telegram.copyMessage(id, important.ohmyDB, vid.msgId, {
                    reply_markup: {
                        inline_keyboard: [[
                            { text: 'Join Sex Chat', url: 'https://rebrand.ly/sex-video-chat' },
                            { text: 'Find Hot Girls', url: 'https://rebrand.ly/online-dating-find-your-match' },
                        ]]
                    }
                })
            }

            if (!nano.includes('fromWeb-')) {
                let user = await users.findOne({ chatid: id })
                if (user.points >= 2) {
                    await user.updateOne({ $inc: { points: -2 } })
                    let vid = await db.findOne({ nano })
                    await bot.telegram.copyMessage(id, -1001586042518, vid.msgId, {
                        reply_markup: {
                            inline_keyboard: [[
                                { text: '🔞 Sex Chatting', url: 'https://rebrand.ly/sex-video-chat' },
                                { text: '😍 Online Dating', url: 'https://rebrand.ly/online-dating-find-your-match' },
                            ]]
                        }
                    })
                    setTimeout(() => {
                        ctx.reply(`You got the file and 2 points deducted from your points balance. \n\n<b>You remained with ${user.points - 2} points.</b>`, {
                            parse_mode: 'HTMl',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: '➕ Add more', url: `https://font5.net/blog/post.html?id=62c1715eff0a4608ebd38ac2#adding-points-ohmy-userid=OH${id}` },
                                        { text: '💰 Balance', callback_data: 'points' }
                                    ]
                                ]
                            }
                        })
                    }, 1000)

                }
                else if (user.points < 2) {
                    await ctx.reply(`Hey <b>${ctx.chat.first_name}</b>, You don't have enough points to get the video. Open the link below to add more points.`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {text: '✨ My Points', callback_data: 'points'},
                                    { text: '➕ Add Points', url: `https://font5.net/blog/post.html?id=62c1715eff0a4608ebd38ac2#adding-points-ohmy-userid=OH${id}` }
                                ],
                            ]
                        }
                    })
                }
            }
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

// bot.command('mama', async ctx=> {
//     let zote = await db.find()

//     zote.forEach((v, i)=> {
//         setTimeout(()=> {
//             bot.telegram.copyMessage(important.xzone, important.ohmyDB, v.msgId)
//         }, 3500 * i)
//     })
// })

bot.command('/broadcast', async ctx => {
    let myId = ctx.chat.id
    let txt = ctx.message.text
    let msg_id = Number(txt.split('/broadcast-')[1].trim())
    if (myId == important.shemdoe || myId == important.halot) {
        try {
            let all_users = await users.find()

            all_users.forEach((u, index) => {
                setTimeout(() => {
                    if(index == all_users.length - 1) {
                        ctx.reply('Done sending offers')
                    }
                    bot.telegram.copyMessage(u.chatid, important.replyDb, msg_id, {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '❤ Contact Anna 💋', url: 'https://rebrand.ly/date-anna9' }
                                ]
                            ]
                        }
                    }).catch((err) => {
                        if (err.message.includes('blocked')) {
                            users.findOneAndDelete({ chatid: u.chatid })
                                .then(() => { console.log(u.chatid + ' is deleted') })
                        }
                    })
                }, index * 40)
            })
        } catch (err) {
            console.log(err.message)
        }
    }

})



bot.command('add', async ctx => {
    let txt = ctx.message.text

    try {
        let arr = txt.split('-')
        let id = Number(arr[1])
        let pts = Number(arr[2])

        let updt = await users.findOneAndUpdate({ chatid: id }, { $inc: { points: pts } }, { new: true })
        await bot.telegram.sendMessage(id, `Congratulations 🎉 \nYour payment is confirmed! You received ${pts} points. Your new balance is ${updt.points} points`)
    } catch (err) {
        errMessage(err, ctx.chat.id)
    }
})

bot.on('channel_post', async ctx => {
    if (ctx.channelPost.chat.id == important.replyDb) {
        if (ctx.channelPost.reply_to_message) {
            let rpId = ctx.channelPost.reply_to_message.message_id
            let cdata = ctx.channelPost.text

            let posts = [
                '62c84d54da06342665e31fb7',
                '62ca86111afa2af6f7a1026c',
                '62cd8fbe9de0786aafdb98b7',
                '62df23671eef6dabf5feecde'
            ]
            let rrnp = Math.floor(Math.random() * posts.length)
            let op2link = `https://font5.net/blog/post.html?id=${posts[rrnp]}#getting-full-show-showid=${cdata}`

            await gifsModel.create({
                nano: cdata,
                gifId: rpId
            })
            await bot.telegram.copyMessage(important.prem_channel, important.replyDb, rpId, {
                disable_notification: true,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '⬇ GET FULL VIDEO (OPT. 1)', url: important.prod_domain + cdata }],
                        [{ text: '⬇ GET FULL VIDEO (OPT. 2)', url: op2link }]
                    ]
                }
            }).catch(err => errMessage(err, ctx.chat.id))
        }
    }
    if (ctx.channelPost.chat.id == important.ohmyDB && ctx.channelPost.video) {
        let fid = ctx.channelPost.video.file_unique_id
        let file_id = ctx.channelPost.video.file_id
        let cap = ctx.channelPost.caption
        let cap_ent = ctx.channelPost.caption_entities
        let caption = cap.split(' - With')[0].trim()
        let msgId = ctx.channelPost.message_id
        let tday = new Date().toLocaleDateString('en-us')

        await db.create({
            caption_entities: cap_ent,
            uniqueId: fid,
            fileId: file_id,
            caption,
            nano: fid + msgId,
            fileType: 'video',
            msgId
        })
        await bot.telegram.copyMessage(important.xzone, important.ohmyDB, msgId, {
            caption: `<b>${cap}\n\n📅Released: ${tday}</b>`,
            parse_mode: 'HTML',
            disable_notification: true,
                reply_markup: {
                    inline_keyboard: [[
                        { text: `Browse Hot Girls`, url: `https://rebrand.ly/online-dating-find-your-match` },
                        { text: `Join Sex Chat`, url: `https://rebrand.ly/sex-video-chat` },
                    ]]
                }
        })
        await ctx.reply(`<code>${fid + msgId}</code>`, {parse_mode: 'HTML'})
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
                            [
                                { text: '💰 Balance', callback_data: 'points' },
                                { text: '➕ Add More', callback_data: 'inst' }
                            ],
                        ]
                    }
                })
            }
        }

        else if (cdata.includes('free-')) {
            let msgid = ctx.callbackQuery.message.message_id
            let nano = cdata.split('free-')[1]
            let vid = await db.findOne({ nano })
            let caption = vid.caption
            let title = caption.split('Full Video | ')[1]
            await bot.telegram.deleteMessage(ctx.chat.id, msgid)
            let our_link = await ctx.reply(`Open our sex video chat, stay on the site for at least 10 seconds and the full video <b>(${title})</b> will be sent to you automatically.`, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '⬇ OPEN TO GET THE FULL VIDEO', url: `www.tele-offers.online/open-offer/complete/${nano}/${ctx.chat.id}/${vid.msgId}` }]
                    ]
                }
            })
            setTimeout(() => {
                bot.telegram.deleteMessage(ctx.chat.id, our_link.message_id)
            }, 60000)
        }
    } catch (err) {
        errMessage(err, ctx.chat.id)
    }
})

bot.on('chat_join_request', async ctx => {
    let chatid = ctx.chatJoinRequest.from.id
    let channel_id = ctx.chatJoinRequest.chat.id

    try {
        let user = await reqModel.findOne({ chatid })
        if (!user) {
            await reqModel.create({
                chatid
            })
            console.log('New requster added to database')
        }

        if (channel_id == important.xzone) {
            await bot.telegram.approveChatJoinRequest(important.xzone, chatid)
            await bot.telegram.sendMessage(chatid, 'Congratulations! 🎉 Your request to join XZONE is approved', {
                reply_markup: { inline_keyboard: [[{ text: 'Enter XZONE', url: 'https://t.me/+OsCEEmeM--diNzU0' }]] }
            })
        }
    } catch (err) {
        errMessage(err, chatid)
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