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

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

function errMessage(err, id) {
    if (err.message && err.description) {
        console.log(err.message)
        bot.telegram.sendMessage(741815228, err.message + ' from ' + id)
    }
    else if (err.message && !err.description) {
        console.log(err.message)
        bot.telegram.sendMessage(741815228, err.message + ' from ' + id)
    } else if (!err.message && err.description) {
        console.log(err.description)
        bot.telegram.sendMessage(741815228, err.description + ' from ' + id)
    }
}



bot.start(async ctx => {
    let id = ctx.chat.id
    let name = ctx.chat.first_name

    try {
        if (ctx.startPayload) {
            let nano = ctx.startPayload

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
                await ctx.reply(`You got a premium porn video and 2 points deducted from your points balance. You remain with ${user.points - 2} points.`, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '➕ Add more', callback_data: 'add_more' },
                                { text: '💰 Balance', callback_data: 'points' }
                            ]
                        ]
                    }
                })
            } else if (user.points < 2) {
                await ctx.reply(`Hello <b>${ctx.chat.first_name}</b>, You don't have enough points to access the premium content. Due to the insufficiency of operation costs of <b>OH! MY channel</b> you'll need to donate a small amount by buying downloading points. See the donation packages below.`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '💰 Get 100 points for $1.0', callback_data: 'inst' }],
                            [{ text: '🥈 Get 200 points for $1.5', callback_data: 'inst' }],
                            [{ text: '💎 Get 400 points for $2.5', callback_data: 'inst' }],
                            [{ text: '🥇 Get 1000 points for $5.0', callback_data: 'inst' }]
                        ]
                    }
                })
            }
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


bot.command('add', async ctx => {
    let txt = ctx.message.text

    try {
        let arr = txt.split('-')
        let id = Number(arr[1])
        let pts = Number(arr[2])

        let updt = await users.findOneAndUpdate({ chatid: id }, { $inc: { points: pts } }, { new: true })
        await bot.telegram.sendMessage(id, `Congratulations 🎉 \nYour payment is confirmed! You received ${pts} points. Your new payment balance is ${updt.points}`)
    } catch (err) {
        errMessage(err, ctx.chat.id)
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
    let chatid = ctx.chat.id
    let name = ctx.chat.first_name

    await ctx.reply(`Hello ${name}, due to the insufficiency of operation costs, our users now will need to donate a small amount by buying downloading points. With points you'll be able to download all premium shows from #Brazzers, #Realitykings, #MomSwaps, #FamilySwaps, #Familystrokes and more... See the packages below.`, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '💰 Get 100 points for $1.0', callback_data: 'inst' }],
                [{ text: '🥈 Get 200 points for $1.5', callback_data: 'inst' }],
                [{ text: '💎 Get 400 points for $2.5', callback_data: 'inst' }],
                [{ text: '🥇 Get 1000 points for $5.0', callback_data: 'inst' }]
            ]
        }
    })
})

bot.action('inst', async ctx => {
    await bot.telegram.copyMessage(ctx.chat.id, -1001586042518, 2609)
})


bot.launch()
    .then((console.log('Bot is running')))
    .catch((err) => {
        console.log('Bot is not running')
        bot.telegram.sendMessage('@shemdoe', err.message)
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