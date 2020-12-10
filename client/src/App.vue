<style lang="scss">
	* {
		box-sizing: border-box;
		font-family: 'Lato', sans-serif;
	}

	html,
	body {
		width: 100%;
		height: 100%;
		padding: 0;
		margin: 0;
		overflow: hidden;
	}
	#app {
		width: 100%;
		height: 100%;
		padding: 5%;
		box-sizing: border-box;
		background-color: #0093e9;
		background-image: linear-gradient(160deg, #0093e9 0%, #80d0c7 100%);
		&.embeded {
			padding: 10px;
			header,
			input {
				display: none;
			}
		}
	}
	#graph-container {
		width: 100%;
		height: 100%;
		margin: auto;
		position: relative;
		overflow: hidden;
		background: #fff;
		border-radius: 5px;
	}
	.logo {
		position: absolute;
		bottom: 10px;
		right: 10px;
		z-index: 9;
		height: 40px;
		pointer-events: none;
	}
	input {
		width: 300px;
		height: 50px;
		padding: 0 15px;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 2;
		background: rgb(55 156 229 / 45%);
		border: 2px solid #379ce3;
		border-bottom-right-radius: 5px;
		border-top: 0;
		border-left: 0;
		box-sizing: border-box;
		color: #000;
		font-size: 20px;
		transition: all 0.5s;
		&:focus {
			width: 100%;
			box-shadow: none;
			outline: none;
			border-right: 0;
			border-bottom-right-radius: 0;
			background: rgb(78 176 247 / 45%);
		}
	}
	.no-results {
		position: absolute;
		top: 50%;
		width: 100%;
		margin-top: -25px;
		font-size: 25px;
		text-align: center;
		text-transform: uppercase;
		font-weight: 700;
	}
</style>

<template>
	<div id="app" :class="{ embeded: isEmbeded }">
		<div id="graph-container">
			<img src="./assets/logo.png" class="logo" alt="Logo" />
			<input type="text" v-model="url" @change="setURL" @focus="$event.target.select()" placeholder="Insert URL" autofocus />
			<loader v-if="isLoading"></loader>
			<div v-if="!hasResults" class="no-results">No results to display</div>
		</div>
	</div>
</template>

<script>
	import CONSTANTS from 'utils/constants'
	import Loader from 'components/Loader'

	export default {
		name: 'App',
		components: {
			loader: Loader
		},
		data() {
			return {
				isEmbeded: false,
				url: 'https://google.com',
				isLoading: true,
				hasResults: true,
				sigma: null,
				maxEdgeSize: 2.5,
				maxNodeSize: 18,
				edgeColor: '#ccc',
				bgColor: '#fff',
				openTimeout: null,
				clicks: 0
			}
		},
		methods: {
			setSettings() {
				this.sigma.killForceAtlas2()

				this.sigma.settings({
					doubleClickEnabled: false,
					labelThreshold: 14,
					maxEdgeSize: this.maxEdgeSize,
					maxNodeSize: this.maxNodeSize
				})

				this.sigma.graph.edges().forEach(e => {
					e.color = this.edgeColor
					e.originalColor = this.edgeColor
				})

				window.sigma.plugins.relativeSize(this.sigma, 1)

				this.sigma.refresh()

				this.sigma.startForceAtlas2({
					gravity: 2,
					scalingRatio: 1
				})

				window.setTimeout(() => {
					this.sigma.killForceAtlas2()
					this.isLoading = false
				}, 3000)
			},
			initGraph(data) {
				if (!data) return
				if (!data.related.length) return (this.hasResults = false)

				const nodes = []
				const edges = []
				const list = [{ url: data.url, color: '#efc835' }]
				const ids = []

				data.related.forEach((rel, i) => {
					list.push(rel)
					edges.push({
						id: i,
						source: data.url,
						target: rel.url,
						size: 1
					})

					rel.related.forEach((_rel, i2) => {
						list.push(_rel)
						edges.push({
							id: i + '+' + i2,
							source: rel.url,
							target: _rel.url,
							size: 1
						})
					})
				})

				list.forEach(node => {
					if (ids.indexOf(node.url) !== -1) return
					nodes.push({
						id: node.url,
						label: node.url,
						x: Math.random(),
						y: Math.random(),
						size: 1,
						color: node.color
					})
					ids.push(node.url)
				})

				const s = new window.sigma({
					graph: {
						nodes,
						edges
					},
					renderer: {
						container: document.getElementById('graph-container'),
						type: 'canvas'
					}
				})

				this.sigma = s

				s.bind('outNode', function() {
					s.graph.edges().forEach(function(e) {
						e.color = e.originalColor
					})

					s.refresh()
				})

				s.bind('overNode', function(e) {
					let nodeId = e.data.node.id,
						toKeep = s.graph.neighbors(nodeId)

					toKeep[nodeId] = e.data.node

					s.graph.edges().forEach(function(e) {
						if (toKeep[e.source] && toKeep[e.target]) e.color = '#efc835'
					})

					s.refresh()
				})

				s.bind('clickNode', e => {
					this.clicks++
					if (this.clicks === 1) {
						setTimeout(() => {
							if (e.data.node.label) {
								if (this.clicks === 1) {
									let win = window.open('http://' + e.data.node.label, '_blank')
									win.focus()
								} else {
									this.url = 'http://' + e.data.node.label
									this.setURL()
								}
							}
							this.clicks = 0
						}, 300)
					}
				})

				this.setSettings()
			},
			async getData() {
				const urlParams = new URLSearchParams(window.location.search)
				const url = urlParams.get('url')

				if (url) this.url = url

				return await this.axios.get('site', {
					params: {
						url: this.url
					}
				})
			},
			async onMount() {
				try {
					this.isLoading = true
					const siteData = await this.getData()
					this.initGraph(siteData.data)
				} catch (err) {
					if (err.response && err.response.status === 404) {
						setTimeout(() => {
							this.onMount()
						}, 5000)
					} else {
						this.isLoading = false
						this.hasResults = false
					}
				}
			},
			setURL() {
				const urlParams = new URLSearchParams(window.location.search)

				urlParams.set('url', this.url)

				window.location.search = urlParams
			}
		},
		created() {
			const urlParams = new URLSearchParams(window.location.search)
			const embed = urlParams.get('embed')
			this.isEmbeded = embed !== null
			document.title = CONSTANTS.title
		},
		async mounted() {
			this.onMount()
		}
	}
</script>
