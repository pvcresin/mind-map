const data = {
	text: 'pvcresin',
	children: [
		{
			text: 'sports',
			children: [
				{ text: 'run' },
				{ text: 'swim' },
				{
					text: 'snow',
					children: [
						{
							text: 'ramen',
							children: [{ text: 'miso' }]
						},
						{ text: 'rice' }
					]
				}
			]
		},
		{ text: 'programming', children: [{ text: 'c' }, { text: 'kotin' }] },
		{
			text: 'framework',
			children: [
				{
					text: 'riot',
					children: [
						{
							text: 'ramen',
							children: [{ text: 'miso' }]
						},
						{ text: 'rice' }
					]
				}
			]
		},
		{
			text: 'eat',
			children: [
				{
					text: 'ramen',
					children: [{ text: 'miso' }]
				},
				{
					text: 'rice',
					children: [
						{
							text: 'ramen',
							children: [{ text: 'miso' }]
						},
						{ text: 'rice' }
					]
				}
			]
		}
	]
}

const buildObject = data => {
	const checkRecursive = obj => {
		if (obj.children === undefined || obj.children.length === 0) {
			obj.depth = 0
			obj.spread = 1
			// console.log('child', obj)
			return obj
		} else {
			const children = obj.children.map(c => checkRecursive(c))
			obj.depth = Math.max(...children.map(c => c.depth)) + 1
			obj.spread = children
				.map(c => c.spread)
				.reduce((prev, next) => prev + next)
			// console.log('parent', obj)
			return obj
		}
	}
	checkRecursive(data)
	return data
}

// console.log(data)

const built = buildObject(data)
console.log(built)

const container = document.querySelector('#drawing')

const size = Math.min(container.clientWidth, container.clientHeight)

const nodes = []
const lines = []

const render = data => {
	const draw = SVG('drawing').size(size, size)

	const totalDepth = data.depth
	const totalSpread = data.spread

	const renderRecursive = (obj, startRad, endRad, r = 0) => {
		const rad = (endRad - startRad) / 2 + startRad
		const x = size / 2.0 + r * Math.cos(rad)
		const y = size / 2.0 + r * Math.sin(rad)

		nodes.push({ obj, x, y, r, rad })

		if (obj.children === undefined || obj.children.length === 0) return

		let currentRad = 0

		obj.children.forEach(c => {
			const range = (endRad - startRad) * (c.spread / obj.spread)

			const nextR =
				(size / 2.0) * ((totalDepth - c.depth) / totalDepth) * 0.8

			const nextStartRad = currentRad + startRad
			const nextEndRad = currentRad + startRad + range
			const nextRad = (nextEndRad - nextStartRad) / 2 + nextStartRad

			const nextX = size / 2.0 + nextR * Math.cos(nextRad)
			const nextY = size / 2.0 + nextR * Math.sin(nextRad)

			lines.push({ x, y, rad, nextX, nextY, nextRad })

			renderRecursive(c, nextStartRad, nextEndRad, nextR)

			currentRad += range
		})
	}

	renderRecursive(data, 0, 2 * Math.PI)

	lines.forEach(l => {
		const anchorDist = 30
		const anchorStartX = l.x + anchorDist * Math.cos(l.rad)
		const anchorStartY = l.y + anchorDist * Math.sin(l.rad)
		const anchorEndX = l.nextX - anchorDist * Math.cos(l.nextRad)
		const anchorEndY = l.nextY - anchorDist * Math.sin(l.nextRad)

		draw.path(
			`M${l.x} ${l.y} C${anchorStartX} ${anchorStartY}
			${anchorEndX} ${anchorEndY} ${l.nextX} ${l.nextY}`
		)
			.fill('none')
			.stroke({
				color: '#666',
				width: 1,
				linecap: 'round',
				linejoin: 'round'
			})
	})

	nodes.forEach(n => {
		const degree = (n.rad * 180) / Math.PI
		const space = 20
		draw.circle(10)
			.attr('cx', n.x)
			.attr('cy', n.y)
			.attr('text', n.obj.text)
			.attr({ fill: 'rgba(60, 25, 127.5)' })
		draw.text(`${n.obj.text}`)
			.font({ family: 'Roboto' })
			.move(n.x + space * Math.cos(n.rad), n.y + space * Math.sin(n.rad))
			.translate(0, -10)
			.rotate(270 <= degree || degree <= 90 ? degree : degree + 180)
	})
}

render(built)
