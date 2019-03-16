const Telegraf = require('telegraf')
const axios = require('axios')
const utils = require('@waves/signature-generator').utils

const bot = new Telegraf(process.env.TOKEN)

const main = async () => {

	bot.startWebhook('/', null, process.env.PORT)

	bot.start(ctx => {
		ctx.reply('Send me Your address')
		getInfo()
	})

	bot.on('text', async (ctx) => {
		const text = ctx.message.text
		let valid = false
		try {
			valid = await utils.crypto.isValidAddress(text)
		} catch (error) {
			console.log(error)
		}
		if (valid) {
			bot.telegram.sendChatAction(ctx.from.id, 'typing')
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
Vostok tokens per token: ${data.perToken}

These figures are estimates and are provided for information only. The exact figures may change due to various factors.</code>`
					ctx.replyWithHTML(stat)
				} else {
					ctx.reply('Ooops')
				}
			} catch (error) {
				console.log(error)
			}
		} else {
			ctx.reply('Is it address?')
		}
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