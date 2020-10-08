const mongoose = require('mongoose')
const updateInterval = 480 // in minutes

const SiteSchema = new mongoose.Schema({
	url: {
		type: String,
		unique: true,
		required: true,
		index: {
			unique: true
		}
	},
	color: String,
	related: [{ type: Object }],
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: () => new Date(-new Date() + (updateInterval * 60 * 1000))
	},
	isUpdating: {
		type: Boolean,
		default: false
	},
	isDeleted: {
		type: Boolean,
		default: false
	}
})

module.exports = mongoose.model('Site', SiteSchema)
