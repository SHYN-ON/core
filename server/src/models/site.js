const mongoose = require('mongoose')

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
	upVotes: {
		type: Number,
		default: 0
	},
	downVotes: {
		type: Number,
		default: 0
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: () => new Date('1980')
	},
	isDeleted: {
		type: Boolean,
		default: false
	}
})

module.exports = mongoose.model('Site', SiteSchema)
