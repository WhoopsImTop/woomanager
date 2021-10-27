import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import de from 'vuetify/lib/locale/de';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#171520',
        secondary: '#424257',
        accent: '#FB7D00',
        error: '#FF5252',
        info: '#2196F3',
        success: '#37AE63',
        warning: '#FFC107',
        gray: '#C3C3CE',
        white: '#FFFFFF'
      },
    },
  },
    lang: {
      locales: { de },
      current: 'de',
    },
});
