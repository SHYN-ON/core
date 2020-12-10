const imgColor = require('img-color')

async function getColor(url) {
	let color

	try {
		color = await imgColor.getDominantColor(`https://www.google.com/s2/favicons?domain=${url}`)
	} catch (_) {}

	return color ? '#' + color.dColor : '#000'
}

module.exports = getColor
