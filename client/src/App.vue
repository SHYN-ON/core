<style lang="scss">
	@import 'styles/main';
</style>

<template>
	<div id="app" :class="{ embeded: isEmbeded }">
		<div id="graph-container">
			<img src="./assets/logo.png" class="logo" alt="Logo" />
			<div v-if="!isLoading && hasResults && !hasVote" class="controls">
				{{ $t('isUseful') }}
				<img src="./assets/vote-up.png" alt="Up vote" @click="vote(true)" />
				<img src="./assets/vote-down.png" alt="Down vote" @click="vote(false)" />
			</div>
			<input 
				v-if="!isEmbeded"
				type="text"
				v-model="url"
				@change="setURL"
				@focus="$event.target.select()"
				:placeholder="$t('urlPlaceholder')"
				autofocus 
			/>
			<loader v-if="isLoading"></loader>
			<div v-if="!hasResults" class="no-results">{{ $t('noResults') }}</div>
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
				clicks: 0,
				site: '',
				get hasVote() {
					return localStorage.getItem(`vote-${this.site}`)
				},
				// eslint-disable-next-line
				set hasVote(value) {
					localStorage.setItem(`vote-${this.site}`, value)
				}
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
				this.site = data.url
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
			},
			async vote (val) {
				const params = {
					url: this.url
				}

				if (!val) params.down = true

				this.hasVote = true
				this.axios.post('site/vote', params)
			},
		},
		created() {
			const urlParams = new URLSearchParams(window.location.search)
			const embed = urlParams.get('embed')

			this.isEmbeded = embed !== null
			
			document.title = `${CONSTANTS.title} - ${this.$t('title')}`
		},
		async mounted() {
			this.onMount()
		}
	}
</script>
