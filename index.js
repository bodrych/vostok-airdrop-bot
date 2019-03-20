const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const axios = require('axios')
const utils = require('@waves/signature-generator').utils

const bot = new Telegraf(process.env.TOKEN)

const replyWithStat = async (ctx, text) => {
	let valid = false
	try {
		valid = await utils.crypto.isValidAddress(text)
		if (valid) {
			try {
				const response = await getInfo(text)
				if (response) {
					const data = response.data
					const stat = 
`<code>Address: ${data.address}

AVG Waves balance: ${data.avg_wbalance}
AVG WCT balance: ${data.avg_wctbalance}

Last Waves balance: ${data.last_wbalance}
Last WCT balance: ${data.last_wctbalace}

Vostok tokens to be distributed: ${data.sumTokens}
Last snapshot: ${response.last_snap} UTC
Vostok tokens per token: ${data.perToken}</code>`
					ctx.reply()
					ctx.editMessageText(stat, Extra.HTML().markup((m) =>
						m.inlineKeyboard([
							m.callbackButton('Update', data.address)
							]
							)))
					ctx.answerCbQuery(null, true)
				} else {
					ctx.reply('Ooops')
				}
			} catch (error) {
				console.log(error)
			}
		} else {
			ctx.reply('Is it address?')
		}
	} catch (error) {
		console.log(error)
	}
}



const main = async () => {

	bot.startWebhook('/', null, process.env.PORT)

	bot.start(ctx => {
		ctx.reply('Send me your address')
	})

	bot.on('text', async (ctx) => {
		replyWithStat(ctx, ctx.message.text)
	})

	bot.action(/^3P.{33}$/, async (ctx) => {
		replyWithStat(ctx, ctx.callbackQuery.data)
	})
}

const getInfo = async (address) => {
	const url = 'http://vostok.wavesplatform.com/search.php'
	const data = `address=${address}`
	try {
		const response = await axios.post(url, data)
		return response.data
	} catch (error) {
		console.log(error)
		return
	}
}

main()