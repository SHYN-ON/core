const frame = document.getElementById('frame');
const source = chrome.app.isInstalled ? 'https://core.shyn.org/' : 'http://localhost:8080/';

chrome.tabs.query({ active: true, currentWindow: true }, function(tab) {
	frame.setAttribute('src', source + '?url=' + encodeURIComponent(tab[0].url) + '&embed=1');
});
