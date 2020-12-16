<style lang="scss">
	@import 'styles/main';
</style>

<template>
	<div id="app" :class="{ embeded: isEmbeded }">
		<div id="graph-container">
			<img src="./assets/logo.png" class="logo" alt="Logo" />
			<div v-if="!isLoading && hasResults && !hasVote" class="controls">
				{{ $t('isUseful') }}
				<img src="./assets/vote-up.png" alt="Up vote" :title="$t('upVote')" @click="vote(true)" />
				<img src="./assets/vote-down.png" alt="Down vote" :title="$t('downVote')" @click="vote(false)" />
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
			<svg id="d3-graph"></svg>
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
				weights: {
					min: 9999,
					max: 0
				},
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
			graphChart() {
				const d3 = window.d3
				const d3graph = d3.select('#d3-graph')
				const vue = this

				let width = parseInt(d3graph.style('width')),
					height = parseInt(d3graph.style('height')),
					fillNode = '#07a0c3',
					strokeNode = '#fff',
					fillNodeHover = '#E47F74',
					fillNeighbors = '#f0c808',
					fillText = '#333',
					strokeLink = d3.rgb(150, 150, 150, 0.6),
					strokeLinkHover = d3.rgb(50, 50, 50, 1),
					minRadius = 5,
					radius = function(node) {
						return minRadius + node.weight * 0.7
					}

				function chart(selection) {
					selection.each(function(data) {
						let zoom = d3
							.zoom()
							.scaleExtent([1 / 2, 5])
							.on('zoom', zoomed)

						let svg = d3.select(this).call(zoom)

						const simulation = d3
							.forceSimulation(data.nodes)
							.force(
								'link',
								d3
									.forceLink(data.edges)
									.id(d => d.id)
									.distance(50)
							)
							.force(
								'charge',
								d3.forceManyBody().strength(d => -radius(d) * 30)
							)
							.force('center', d3.forceCenter(width / 3, height / 2))
							.force('x', d3.forceX())
							.force('y', d3.forceY())

						function zoomed() {
							let scale = d3.event.transform.k
							g.attr('transform', `translate(${d3.event.transform.x}, ${d3.event.transform.y}) scale(${scale})`)
						}

						const dragNode = function(simulation) {
							function dragstarted(d) {
								if (!d3.event.active) simulation.alphaTarget(0.3).restart()
								d.fx = d.x
								d.fy = d.y
							}

							function dragged(d) {
								d.fx = d3.event.x
								d.fy = d3.event.y
							}

							function dragended(d) {
								if (!d3.event.active) simulation.alphaTarget(0)
								d.fx = null
								d.fy = null
							}

							return d3
								.drag()
								.on('start', dragstarted)
								.on('drag', dragged)
								.on('end', dragended)
						}

						const getNeighbors = function(node) {
							let id = d3.select(node).attr('id')
							// Filter the links about the selected character
							let neighbors = data.edges.filter(link => link.source.id === id || link.target.id === id)

							// Creates an array with all the node id that has interacted with the selected node
							// The prepend hashtag will help us to select in CSS th nodes
							const neighborsNodes = neighbors.map(function(link) {
								if (link.source.id === id) {
									return '#' + link.target.id
								} else {
									return '#' + link.source.id
								}
							})

							let neighborsEdges = neighbors.map(d => '#link_' + d.index).join(',')

							return {
								nodes: neighborsNodes.join(),
								links: neighborsEdges
							}
						}

						const handleMouseOver = function() {
							let neighbors = getNeighbors(this)
							this.parentNode.appendChild(this)

							d3.select(this)
								.transition()
								.select('circle')
								.attr('fill', fillNodeHover)

							d3.select(this)
								.transition()
								.select('text')
								.attr('fill-opacity', 1)
								.attr('stroke-opacity', 1)

							d3.selectAll(neighbors.nodes)
								.select('circle')
								.transition()
								.attr('fill', fillNeighbors)

							d3.selectAll(neighbors.nodes)
								.select('text')
								.transition()
								.attr('fill-opacity', 1)
								.attr('stroke-opacity', 1)

							d3.selectAll(neighbors.links)
								.transition()
								.attr('stroke', strokeLinkHover)
						}

						const handleMouseOut = function() {
							let neighbors = getNeighbors(this)
							d3.select(this)
								.select('circle')
								.transition()
								.attr('fill', n => n.color || fillNode)

							d3.selectAll('.nodes text')
								.filter(d => d.weight < vue.weights.max / 2)
								.transition()
								.attr('fill-opacity', 0)
								.attr('stroke-opacity', 0)

							d3.selectAll(neighbors.nodes)
								.select('circle')
								.transition()
								.attr('fill', n => n.color || fillNode)

							d3.selectAll(neighbors.links)
								.transition()
								.attr('stroke', strokeLink)
						}

						const handleMouseUp = function(node) {
							if (node.url) window.open(`https://${node.url}`)
						}

						let g = svg.append('g').attr('id', 'force-directed-graph')

						let links = g
							.append('g')
							.attr('class', 'links')
							.attr('stroke', strokeLink)
							.attr('stroke-opacity', 0.6)
							.selectAll('line')
							.data(data.edges)
							.enter()
							.append('line')
							.attr('stroke-width', 2)
							.attr('id', (d, i) => 'link_' + i)

						let nodes = g
							.append('g')
							.attr('class', 'nodes')
							.selectAll('circle')
							.data(data.nodes)
							.enter()
							.append('g')
							.attr('class', 'node')
							.attr('id', d => d.id)
							.on('mouseover', handleMouseOver)
							.on('mouseout', handleMouseOut)
							.on('click', handleMouseOver)
							.call(dragNode(simulation))
							.on('click', handleMouseUp)

						nodes
							.append('circle')
							.attr('r', d => radius(d))
							.attr('fill', n => n.color || fillNode)
							.attr('stroke', strokeNode)
							.attr('stroke-width', 3)

						nodes
							.append('text')
							.text(d => d.label.toUpperCase())
							.attr('fill', fillText)
							.attr('fill-opacity', 1)
							.attr('stroke-opacity', 1)
							.attr('font-size', d => {
								let perc = d.weight / vue.weights.max
								return Math.max(9, 15 * perc)
							})
							.attr('text-anchor', 'middle')
							.filter(d => d.weight < vue.weights.max / 2)
							.attr('fill-opacity', 0)
							.attr('stroke-opacity', 0)

						simulation.on('end', () => {
							if (!vue.isLoading) return
							let bounds = g.node().getBBox()
							let parent = g.node().parentElement
							let fullWidth = parent.clientWidth,
								fullHeight = parent.clientHeight
							let widthz = bounds.width,
								heightz = bounds.height
							let midX = bounds.x + widthz / 2,
								midY = bounds.y + heightz / 2
							let scale = 0.75 / Math.max(widthz / fullWidth, heightz / fullHeight)
							let translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY]

							svg.call(zoom.transform, d3.zoomIdentity.scale(scale).translate(translate[0], translate[1]))
							vue.isLoading = false
						})

						simulation.on('tick', () => {
							links
								.attr('x1', d => d.source.x)
								.attr('y1', d => d.source.y)
								.attr('x2', d => d.target.x)
								.attr('y2', d => d.target.y)

							nodes
								.selectAll('circle')
								.attr('cx', d => d.x)
								.attr('cy', d => d.y)

							nodes
								.selectAll('text')
								.attr('x', d => d.x)
								.attr('y', d => d.y + radius(d) / 4)
						})
					})
				}

				chart.fillNode = function(value) {
					if (!arguments.length) return fillNode
					fillNode = value
					return chart
				}

				chart.fillNodeHover = function(value) {
					if (!arguments.length) return fillNodeHover
					fillNodeHover = value
					return chart
				}

				chart.fillNeighbors = function(value) {
					if (!arguments.length) return fillNeighbors
					fillNeighbors = value
					return chart
				}

				chart.radius = function(value) {
					if (!arguments.length) return radius
					radius = value
					return chart
				}

				chart.fillText = function(value) {
					if (!arguments.length) return fillText
					fillText = value
					return chart
				}

				chart.strokeNode = function(value) {
					if (!arguments.length) return strokeNode
					strokeNode = value
					return chart
				}

				chart.strokeLinkHover = function(value) {
					if (!arguments.length) return strokeLinkHover
					strokeLinkHover = value
					return chart
				}

				chart.strokeLink = function(value) {
					if (!arguments.length) return strokeLink
					strokeLink = value
					return chart
				}

				return chart
			},
			initGraph(data) {
				if (!data) return
				this.site = data.url
				if (!data.related.length) return (this.hasResults = false)

				const d3 = window.d3
				const d3graph = d3.select('#d3-graph')

				const graph = this.graphChart()
					.fillNode('#758686')
					.strokeNode('#494853')
					.fillNodeHover('#9d3a43')
					.fillNeighbors('#b38a38')
					.fillText('#fff')
					.strokeLinkHover('#494853')

				d3graph.datum(this.formatData(data)).call(graph)
			},
			formatData(data) {
				function safeId(str) {
					return str.replace(/\W/g, '_')
				}
				function genLabel(url) {
					return url.split('.')[0]
				}
				const nodes = []
				const edges = []
				const list = [{ url: data.url, color: data.color }]
				const ids = []

				data.related.forEach(rel => {
					list.push(rel)
					edges.push({
						source: safeId(data.url),
						target: safeId(rel.url)
					})

					rel.related.forEach(_rel => {
						list.push(_rel)
						edges.push({
							source: safeId(rel.url),
							target: safeId(_rel.url)
						})
					})
				})

				list.forEach(node => {
					if (ids.indexOf(node.url) !== -1) return
					nodes.push({
						id: safeId(node.url),
						url: node.url,
						label: genLabel(node.url),
						color: node.color
					})
					ids.push(node.url)
				})
				const graphData = {
					nodes: nodes,
					edges: edges
				}

				// Counts the number each nodes have with each other
				graphData.nodes.forEach(d => {
					d.weight = graphData.edges.reduce(function(total, link) {
						if (d.id === link.source || d.id === link.target) total += 1
						return total
					}, 0)
					this.weights.min = Math.min(this.weights.min, d.weight)
					this.weights.max = Math.max(this.weights.max, d.weight)
				})

				return graphData
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
			async vote(val) {
				const params = {
					url: this.url
				}

				if (!val) params.down = true

				this.hasVote = true
				this.axios.post('site/vote', params)
			}
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
