import Vue from 'vue'
import App from 'App'
import i18n from 'plugins/i18n'
import 'plugins/typy'
import 'plugins/axios'
import 'plugins/moment'
import store from 'store'

Vue.config.productionTip = false

new Vue({
	i18n,
	store,
	render: h => h(App)
}).$mount('#app')
