const { Telegraf } = require('telegraf')
require('dotenv').config()
const mongoose = require('mongoose')
const db = require('./database/db')
const users = require('./database/users')
const { nanoid } = require('nanoid')
const offer = require('./database/offers')
const gifsModel = require('./database/gif')
const reqModel = require('./database/requestersDb')
const xbongoDB = require('./database/xbongoReq')

const bot = new Telegraf(process.env.BOT_TOKEN)
    .catch((err) => console.log(err.message))

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
    ohmyDB: -1001586042518,
    xbongo: -1001263624837
}

//delaying
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function errMessage(err, id) {
    if (!err.description) {
        console.log(err)
        if (!err.message.includes('bot was blocked')) {
            bot.telegram.sendMessage(741815228, err.message + ' from ' + id)
                .catch((err) => console.log(err.message))
        }

    } else {
        console.log(err)
        if (!err.description.includes('bot was blocked')) {
            bot.telegram.sendMessage(741815228, err.description + ' - from ' + id)
                .catch((err) => console.log(err.message))
        }
    }
}

async function sendVideo(bot, ctx, id, nano) {
    let vid = await db.findOne({ nano })
    await bot.telegram.copyMessage(id, -1001586042518, vid.msgId, {
        protect_content: true,
        reply_markup: {
            inline_keyboard: [[
                { text: 'Join Here For More...', url: 'https://t.me/+TCbCXgoThW0xOThk' }
            ]]
        }
    })
}



bot.start(async ctx => {
    let id = ctx.chat.id
    let name = ctx.chat.first_name

    try {
        if (ctx.startPayload) {
            let nano = ctx.startPayload

            if (nano.includes('fromWeb-')) {
                let webNano = nano.split('fromWeb-')[1]
                nano = webNano
            }

            let thisUser = await users.findOne({ chatid: id })
            if (!thisUser) {
                await users.create({ chatid: id, name, unano: `user${id}`, points: 2 })
                console.log('New user Added')
                await sendVideo(bot, ctx, id, nano)
                await delay(1000)
                let inf = await ctx.reply(`You got the video. You remained with 2 free videos. \n\nWhen free videos depleted you'll have to open our offer page for 5 seconds to get a video.`)
                setTimeout(() => {
                    ctx.deleteMessage(inf.message_id)
                        .catch((e) => console.log(e.message))
                }, 5000)
            } else {
                if (thisUser.points > 0) {
                    await sendVideo(bot, ctx, id, nano)
                    let updt = await users.findOneAndUpdate({chatid: id}, {$inc: {points: -1}}, {new: true})
                    await delay(1000)
                    let inf = await ctx.reply(`You got the video. You remained with ${updt.points} free videos. When free videos depleted you'll have to open our offer page for 5 seconds to get a video.`)
                    setTimeout(() => {
                        ctx.deleteMessage(inf.message_id)
                            .catch((e) => console.log(e.message))
                    }, 5000)
                } else {
                    let our_vid = await db.findOne({nano})
                    let url = `http://get-ohmy-full-video.font5.net/ohmy/${id}/${nano}`
                    await ctx.reply(`You're about to download <b>${our_vid.caption}</b>\n\n<i>open the site below for at least 5 seconds to get this video</i>`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {text: "⬇️ GET the VIDEO", url}
                                ]
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

bot.command('/broadcast', async ctx => {
    let url = 'https://redirecting5.eu/p/tveg/GFOt/46RX'
    let rp_mkup = {
        inline_keyboard: [
            [{text: "♦ PLAY NOW", url}],
            [{text: "🔞 More 18+ Games", url}]
        ]
    }
    let myId = ctx.chat.id
    let txt = ctx.message.text
    let msg_id = Number(txt.split('/broadcast-')[1].trim())
    if (myId == important.shemdoe || myId == important.halot) {
        try {
            let all_users = await users.find()

            all_users.forEach((u, index) => {
                setTimeout(() => {
                    if (index == all_users.length - 1) {
                        ctx.reply('Done sending offers')
                    }
                    bot.telegram.copyMessage(u.chatid, important.replyDb, msg_id, {
                        reply_markup: rp_mkup
                    })
                        .then(() => console.log('Offer sent to ' + u.chatid))
                        .catch((err) => {
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

bot.command('stats', async ctx=> {
    try {
        let watu = await users.countDocuments()
        let vids = await db.countDocuments()

        await ctx.reply(`Total Users: ${watu.toLocaleString('en-us')}`)
        await ctx.reply(`Total Videos: ${vids.toLocaleString('en-us')}`)
    } catch (err) {
        await ctx.reply(err.message)
        .catch(e=> console.log(e.message))
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

bot.command('points', async ctx => {
    try {
        let user = await users.findOne({ chatid: ctx.chat.id })
        await ctx.reply(`Hey, ${ctx.chat.first_name}, you have ${user.points} point(s).`)
    } catch (err) {
        console.log(err.message)
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
                '62df23671eef6dabf5feecde',
                '63212e1f6eeba4e82a45bd27',
                '632e5c7d2744c9849dd69c0a',
                '632e58662744c9849dd69ba1'
            ]
            let rrnp = Math.floor(Math.random() * posts.length)
            let op2link = `https://font5.net/blog/post.html?id=${posts[rrnp]}#getting-full-show-showid=${cdata}`

            let botlink = `http://t.me/ohmychannelV2bot?start=${cdata}`

            await gifsModel.create({
                nano: cdata,
                gifId: rpId
            })
            await bot.telegram.copyMessage(important.prem_channel, important.replyDb, rpId, {
                disable_notification: true,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '⬇ DOWNLOAD FULL VIDEO #L1', url: botlink }],
                        [{ text: '⬇ DOWNLOAD FULL VIDEO #L2', url: op2link }],
                    ]
                }
            }).catch(err => errMessage(err, ctx.chat.id))

            await bot.telegram.copyMessage(important.xzone, important.replyDb, rpId, {
                disable_notification: true,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '⬇ DOWNLOAD FULL VIDEO #L1', url: botlink }],
                        [{ text: '⬇ DOWNLOAD FULL VIDEO #L2', url: op2link }],
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
        let tday = new Date().toDateString()

        await db.create({
            caption_entities: cap_ent,
            uniqueId: fid,
            fileId: file_id,
            caption,
            nano: fid + msgId,
            fileType: 'video',
            msgId
        })
        await ctx.reply(`<code>${fid + msgId}</code>`, { parse_mode: 'HTML' })
    }

    if (ctx.channelPost.chat.id == important.pzone && ctx.channelPost.forward_date) {
        let msg_id = ctx.channelPost.message_id
        await bot.telegram.copyMessage(important.pzone, important.pzone, msg_id)
        await bot.telegram.deleteMessage(important.pzone, msg_id)
    }
})

bot.on('chat_join_request', async ctx => {
    let chatid = ctx.chatJoinRequest.from.id
    let channel_id = ctx.chatJoinRequest.chat.id

    try {
        if (channel_id == important.xzone) {
            let user = await reqModel.findOne({ chatid })
            if (!user) {
                await reqModel.create({
                    chatid
                })
                console.log('New requster added to database')
            }
            await bot.telegram.approveChatJoinRequest(important.xzone, chatid)
            await bot.telegram.sendMessage(chatid, 'Congratulations! 🎉 Your request to join XZONE is approved', {
                reply_markup: { inline_keyboard: [[{ text: 'Enter XZONE', url: 'https://t.me/+OsCEEmeM--diNzU0' }]] }
            })
        }

        else if (channel_id == important.xbongo) {
            let user = await xbongoDB.findOne({ chatid })
            if (!user) {
                await xbongoDB.create({
                    chatid
                })
                console.log('New bongo requster added to database')
            }
            await bot.telegram.approveChatJoinRequest(important.xbongo, chatid)
            await bot.telegram.sendMessage(chatid, 'Hongera, ombi lako la kujiunga na channel ya Raha Tupu ❤ limekubaliwa', {
                reply_markup: { inline_keyboard: [[{ text: 'Ingia Raha Tupu ❤', url: 'https://t.me/+DozKYTakahllNmVk' }]] }
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
    bot.telegram.sendMessage(important.shemdoe, reason + ' --> It is an unhandled rejection.').catch(err => {
        console.log(err.message)
    })
    console.log(reason)
})

//caught any exception
process.on('uncaughtException', (err) => {
    console.log(err)
    bot.telegram.sendMessage(741815228, err.message + ' - It is an uncaught exception.')
        .catch((err) => console.log(err.message))
})