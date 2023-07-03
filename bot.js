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
const oh_counts = require('./database/redirects-counter')
const oh_channels = require('./database/oh-channels')
const rtbotusers = require('./database/rtbot-users')

//fns
const call_reactions_function = require('./functions/reactions')

const bot = new Telegraf(process.env.BOT_TOKEN)
    .catch((err) => console.log(err.message))

mongoose.set('strictQuery', false)
mongoose.connect(`mongodb://${process.env.USER}:${process.env.PASS}@nodetuts-shard-00-00.ngo9k.mongodb.net:27017,nodetuts-shard-00-01.ngo9k.mongodb.net:27017,nodetuts-shard-00-02.ngo9k.mongodb.net:27017/ohmyNew?ssl=true&replicaSet=atlas-pyxyme-shard-0&authSource=admin&retryWrites=true&w=majority`)
    .then(() => {
        console.log('Bot connected to the database')
    }).catch((err) => {
        console.log(err)
        bot.telegram.sendMessage(741815228, 'mongoose from bot ' + err.message)
    })

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

const imp = {
    replyDb: -1001608248942,
    pzone: -1001352114412,
    prem_channel: -1001470139866,
    local_domain: 't.me/rss_shemdoe_bot?start=',
    prod_domain: 't.me/ohmychannelV2bot?start=',
    shemdoe: 741815228,
    halot: 1473393723,
    xzone: -1001740624527,
    ohmyDB: -1001586042518,
    xbongo: -1001263624837,
    rtgrp: -1001899312985,
    rtprem: -1001946174983,
    rt4i4n: -1001880391908,
    rtmalipo: 5849160770
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
                    let updt = await users.findOneAndUpdate({ chatid: id }, { $inc: { points: -1 } }, { new: true })
                    await delay(1000)
                    let inf = await ctx.reply(`You got the video. You remained with ${updt.points} free videos. When free videos depleted you'll have to open our offer page for 5 seconds to get a video.`)
                    setTimeout(() => {
                        ctx.deleteMessage(inf.message_id)
                            .catch((e) => console.log(e.message))
                    }, 5000)
                } else {
                    let our_vid = await db.findOne({ nano })
                    let url = `http://get-ohmy-full-video.font5.net/ohmy/${id}/${nano}`
                    let fromRt = await rtbotusers.findOne({ chatid: id })
                    //angalia kama ni mswahili
                    if (fromRt) {
                        url = `https://t.me/rahatupu_tzbot?start=RTBOT-${nano}`
                    }

                    await ctx.reply(`You're about to download <b>${our_vid.caption}</b>\n\n<i>open the site below for at least 5 seconds to get this video</i>`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: "⬇️ GET the VIDEO", url }
                                ]
                            ]
                        }
                    })
                }
            }
        } else {
            await ctx.reply('Hello, Return/Enter to our channel for full videos')
        }
    } catch (err) {
        errMessage(err, id)
    }
})

bot.command('p', async ctx => {
    try {
        let com = ctx.message.text
        let txt = com.split('=')[1]
        let url320 = txt.replace(/2160p/g, '320p')
        await bot.telegram.sendVideo(imp.pzone, url320)
    } catch (err) {
        await ctx.reply(err.message)
    }
})

bot.command('iphone', async ctx => {
    if (ctx.chat.id == imp.rtmalipo) {
        try {
            let all = await gifsModel.find()

            for (let [index, v] of all.entries()) {
                setTimeout(() => {
                    let url = `https://t.me/rahatupu_tzbot?start=RTBOT-${v.nano}`
                    bot.telegram.copyMessage(imp.rt4i4n, imp.replyDb, v.gifId, {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '⬇ DOWNLOAD FULL VIDEO', url }
                                ]
                            ]
                        }
                    })
                        .catch(e => console.log(e.message))
                }, index * 3.5 * 1000)
            }
        } catch (err) {
            console.log(err.message)
        }
    }
})

//reactions buttons
call_reactions_function(bot, imp)

bot.command('/broadcast', async ctx => {
    let url = 'https://redirecting5.eu/p/tveg/GFOt/46RX'
    let rp_mkup = {
        inline_keyboard: [
            [{ text: "♦ PLAY NOW", url }],
            [{ text: "🔞 More 18+ Games", url }]
        ]
    }
    let myId = ctx.chat.id
    let txt = ctx.message.text
    let msg_id = Number(txt.split('/broadcast-')[1].trim())
    if (myId == imp.shemdoe || myId == imp.halot) {
        try {
            let all_users = await users.find()

            all_users.forEach((u, index) => {
                setTimeout(() => {
                    if (index == all_users.length - 1) {
                        ctx.reply('Done sending offers')
                    }
                    bot.telegram.copyMessage(u.chatid, imp.replyDb, msg_id, {
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

bot.command('stats', async ctx => {
    try {
        let watu = await users.countDocuments()
        let vids = await db.countDocuments()
        let redirects = await oh_counts.findOne({ id: 'shemdoe' })

        await ctx.reply(`Total Users: ${watu.toLocaleString('en-us')} \n\nTotal Videos: ${vids.toLocaleString('en-us')} \n\nTotal Redirects: ${redirects.count.toLocaleString('en-us')}`)
    } catch (err) {
        await ctx.reply(err.message)
            .catch(e => console.log(e.message))
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
    try {
        if (ctx.channelPost.chat.id == imp.replyDb) {
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

                //post to XBONGO
                let rtbot = `https://t.me/rahatupu_tzbot?start=RTBOT-${cdata}`
                await bot.telegram.copyMessage(imp.rtprem, imp.replyDb, rpId, {
                    disable_notification: true,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '⬇ DOWNLOAD FULL VIDEO', url: rtbot }]
                        ]
                    }
                })

                await bot.telegram.copyMessage(imp.rt4i4n, imp.replyDb, rpId, {
                    disable_notification: true,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '⬇ DOWNLOAD FULL VIDEO', url: rtbot }]
                        ]
                    }
                })
            }
        }
        if (ctx.channelPost.chat.id == imp.ohmyDB && ctx.channelPost.video) {
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

        if (ctx.channelPost.chat.id == imp.pzone && ctx.channelPost.forward_date) {
            let msg_id = ctx.channelPost.message_id
            await bot.telegram.copyMessage(imp.pzone, imp.pzone, msg_id)
            await bot.telegram.deleteMessage(imp.pzone, msg_id)
        }

        let impChannels = [imp.pzone, imp.ohmyDB, imp.replyDb]
        let url = 'https://t.me/+s9therYKwshlNDA8'
        let txt = ctx.channelPost.text
        let txtid = ctx.channelPost.message_id
        let chan_id = ctx.channelPost.chat.id
        let title = ctx.channelPost.chat.title
        let chan_owner
        let rp_mkup = {
            inline_keyboard: [
                [{ text: '🔞 FREE XXX VIDEOS 💋', url }],
                [{ text: '🔥 FULL BRAZZERS VIDEOS ❤', url }],
                [{ text: '❌ XVIDEOS & PORNHUB CLIPS 💋', url }],
                [{ text: '❤ JOIN ESCORTS & DATING GROUP', url }],
                [{ text: '🍆🍆BIG DICKS && TIGHT PUSSIES🍑🍑', url }],
            ]
        }

        if (txt.toLowerCase() == 'add me' && !impChannels.includes(chan_id)) {
            let chat = await ctx.getChatAdministrators()
            for (let c of chat) {
                if (c.status == 'creator') {
                    chan_owner = c.user.first_name
                }
            }

            let the_ch = await oh_channels.findOne({ chan_id })
            if (!the_ch) {
                await oh_channels.create({ chan_id, title, owner: chan_owner })
                let m1 = await ctx.reply('Channel added to DB')
                await delay(1000)
                await ctx.deleteMessage(txtid)
                await ctx.deleteMessage(m1.message_id)
                await bot.telegram.copyMessage(chan_id, imp.pzone, 7704, {
                    reply_markup: rp_mkup
                })
            } else { await ctx.reply('Channel already added') }
        }
    } catch (err) {
        await ctx.reply(err.message)
        console.log(err.message)
    }
})

bot.on('chat_join_request', async ctx => {
    let chatid = ctx.chatJoinRequest.from.id
    let channel_id = ctx.chatJoinRequest.chat.id
    let cha_title = ctx.chatJoinRequest.chat.title
    let name = ctx.chatJoinRequest.from.first_name

    const notOperate = [imp.xbongo, imp.rtprem, imp.rtgrp]

    try {
        //dont process rahatupu
        if (!notOperate.includes(channel_id)) {
            let user = await users.findOne({ chatid })
            if (!user) {
                await users.create({ points: 3, name, chatid, unano: `user${chatid}` })
            }
            await bot.telegram.approveChatJoinRequest(channel_id, chatid)
            await bot.telegram.sendMessage(chatid, `Congratulations! 🎉 Your request to join <b>${cha_title}</b> is approved.`)
        }

    } catch (err) {
        errMessage(err, chatid)
    }
})


bot.launch()
    .then((console.log('Bot is running')))
    .catch((err) => {
        console.log('Bot is not running')
        bot.telegram.sendMessage(imp.shemdoe, err.message)
    })


process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

process.on('unhandledRejection', (reason, promise) => {
    bot.telegram.sendMessage(imp.shemdoe, reason + ' --> It is an unhandled rejection.').catch(err => {
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

const http = require('http')
const server = http.createServer((req, res)=> {
    res.writeHead(200, {"Content-Type": "text/plain"})
    res.end('Karibu, Dramastorebot')
})

server.listen(process.env.PORT || 3000, ()=> console.log('Listen to port 3000'))