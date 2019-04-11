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
	} catch (error) {
		console.log(error)
	}
	if (valid) {
		try {
			const response = await getInfo(text)
			if (response) {
				const data = response.data
				let stat2 = 
					`<code>AVG Waves balance: ${data.avg_wbalance2}\n` +
					`AVG WCT balance: ${data.avg_wctbalance2}\n` +
					`Last Waves balance: ${data.last_wbalance2}\n` +
					`Last WCT balance: ${data.last_wctbalace2}\n` +
					`Vostok tokens to be distributed: ${data.sumTokens2}\n` +
					`Last snapshot: ${response.last_snap2} UTC\n` +
					`Vostok tokens per token: ${data.perToken2}</code>`
				if (data.verified == 0) {
					stat2 += '\n\nYour address is not verified. To get your tokens you need to <a href="https://vostok.wavesplatform.com">auth</a> with Waves Keeper or send transaction with 0.0001 WAVES to address <a href="https://client.wavesplatform.com/#send/WAVES?recipient=3PBNiHBcp8rxiYkGVGNHEGZHEamb1aXeWVv&amount=0.0001&strict=true">3PBNiHBcp8rxiYkGVGNHEGZHEamb1aXeWVv</a>'
				}
				let stat1 = 
					`<code>AVG Waves balance: ${data.avg_wbalance}\n` +
					`AVG WCT balance: ${data.avg_wctbalance}\n` +
					`Last Waves balance: ${data.last_wbalance}\n` +
					`Last WCT balance: ${data.last_wctbalace}\n` +
					`Vostok tokens to be distributed: ${data.sumTokens}\n` +
					`Last snapshot: ${response.last_snap} UTC\n` +
					`Vostok tokens per token: ${data.perToken}</code>`

				let stat =
					`<b>Address: ${data.address}</b>\n\n` +
					`<b>Second stage</b>\n` +
					stat2 +
					`\n\n<b>First stage</b>\n` +
					stat1

				return ctx.reply(stat, Extra.HTML().markup((m) =>
					m.inlineKeyboard([
						m.callbackButton('Update', data.address)
						]
						)))
			} else {
				ctx.reply('Ooops')
			}
		} catch (error) {
			console.log(error)
		}
	} else {
		ctx.reply('Is it address?')
	}
}



const main = async () => {

	bot.startWebhook('/', null, process.env.PORT)

	bot.start(ctx => {
		ctx.reply('Send me your address')
	})

	bot.on('text', async (ctx) => {
		return replyWithStat(ctx, ctx.message.text)
	})

	bot.action(/^3P.{33}$/, async (ctx) => {
		ctx.answerCbQuery(null, true)
		return replyWithStat(ctx, ctx.callbackQuery.data)
	})
}

const getInfo = async (address) => {
	const url = 'http://vostok.wavesplatform.com/search.php'
	const data = `address=${address}`
	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		'X-Requested-With': 'XMLHttpRequest'
	}
	try {
		const response = await axios.post(url, data, { headers })
		return response.data
	} catch (error) {
		console.log(error)
		return
	}
}

main()