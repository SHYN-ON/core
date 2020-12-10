<style scoped lang="scss">
	$color1: #d00000;
	$color2: #3298ae;

	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}
		50% {
			transform: rotate(180deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes rotate2 {
		0% {
			transform: rotate(0deg);
			border-top-color: $color1;
		}
		50% {
			transform: rotate(180deg);
			border-top-color: $color2;
		}
		100% {
			transform: rotate(360deg);
			border-top-color: $color1;
		}
	}

	@mixin loaderDivMixin {
		border-radius: 50%;
		padding: 8px;
		border: 2px solid transparent;
		animation: rotate linear 3.5s infinite;
	}

	section {
		position: absolute;
		top: 0;
		z-index: 9;
		left: 0;
		width: 100%;
		height: 100%;
		background: #fff;
	}

	.loader {
		position: absolute;
		top: 50%;
		left: 50%;
		margin: -75px 0 0 -75px;
		width: 150px;
		height: 150px;
		display: block;
		overflow: hidden;
		div {
			height: 100%;
		}
		> div {
			border-top-color: #1f647e !important;
			border-bottom-color: #1f647e !important;
		}
		> div > div {
			border-top-color: #16101b !important;
			border-bottom-color: #16101b !important;
		}

		> div > div > div {
			border-top-color: #f18f02 !important;
			border-bottom-color: #f18f02 !important;
		}
	}

	.loader1,
	.loader1 div {
		@include loaderDivMixin;
		border-top-color: $color1;
		border-left-color: $color2;
		animation-timing-function: cubic-bezier(0.55, 0.38, 0.21, 0.88);
		animation-duration: 3s;
	}

	div:hover {
		animation-play-state: paused;
	}

	.loader,
	.loader * {
		will-change: transform;
	}
</style>

<template>
	<section>
		<div class="loader loader1">
			<div>
				<div>
					<div>
						<div>
							<div>
								<div></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
	export default {
		name: 'loader'
	}
</script>
