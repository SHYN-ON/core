const frame = document.getElementById('frame');
const source = chrome.app.isInstalled ? 'TODO: INSER LIVE URL HERE' : 'http://localhost:8080/';

chrome.tabs.query({ active: true, currentWindow: true }, function(tab) {
	frame.setAttribute('src', source + '?url=' + tab[0].url + '&embed');
});
