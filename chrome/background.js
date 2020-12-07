const source = chrome.app.isInstalled ? 'https://core.shyn.org/api' : 'http://localhost/api';
let currentUrl = false;

function isValidUrl(string) {
	let url;

	try {
		url = new URL(string);
	} catch (_) {
		return false;  
	}

	return url.protocol === 'http:' || url.protocol === 'https:';
}

async function setRelatedCount(url) {
	if (!isValidUrl(url) || currentUrl !== url) return 
	chrome.browserAction.setBadgeText({ text: '' });

	try {
		let siteReq = await fetch(source + '/site?url=' + url);
		if (siteReq.status === 404) {
			return setTimeout(() => {
				setRelatedCount(url)
			}, 5000)
		} 

		const site = await siteReq.json();

		if (site) {
			let list = []
	
			site.related.forEach(rel => {
				list.push(rel.url)
				rel.related.forEach(_rel => {
					list.push(_rel.url)
				})
			})
			list = [...new Set(list)];
	
			const counter = list.length + 1
	
			chrome.browserAction.setBadgeText({ text: counter <= 1 ? '0' : counter.toString() });
		}
	} catch (_) {}
} 

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
	if (changeInfo.status === 'complete') {
		if (tab && tab.url) {
			currentUrl = tab.url;
			setRelatedCount(tab.url);
		}
	}
})

chrome.tabs.onActivated.addListener(async function(activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function(tab) {
		currentUrl = tab.url;
		setRelatedCount(tab.url);
	});
});

setInterval(function() {
	if (currentUrl) {
		setRelatedCount(currentUrl);
	}
}, 3600 * 1000)
