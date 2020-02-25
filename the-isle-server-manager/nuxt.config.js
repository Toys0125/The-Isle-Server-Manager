import colors from 'vuetify/es5/util/colors'
require('dotenv').config()
import fs from 'fs'
import path from 'path'
export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: '%s - ' + process.env.npm_package_name,
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    //'plugins/index.js'
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxtjs/vuetify',
    '@nuxtjs/dotenv',
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/auth',
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    baseURL:process.env.BASE_URL,
    credentials:false
  },
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: { url: process.env.BackendURL+process.env.BackendPORT+'/login', method: 'post', propertyName: false },
          user: {url: process.env.BackendURL+process.env.BackendPORT+'/user', method:'get', propertyName:'user'},
          logout: false
          // logout: {url: process.env.API_URL+'/login/logout', method: 'post', propertyName:'data'}
        },
        tokenRequired: false,
        fullPathRedirects: true
      }
    }
  },
  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.green.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },
  server: {
    port: process.env.PORT, // default: 3000
    host: process.env.HOST, // default: localhost
    https:{
      key: fs.readdirSync(path.resolve(process.cwd(),'../')).filter(item =>item.endsWith('.key'))==true?fs.readFileSync(path.resolve(process.cwd(),'../'+fs.readdirSync(path.resolve(process.cwd(),'../')).filter(item =>item.endsWith('.key')))):null,
      cert: fs.readdirSync(path.resolve(process.cwd(),'../')).filter(item =>item.endsWith('.crt'))==true?fs.readFileSync(path.resolve(process.cwd(),'../'+fs.readdirSync(path.resolve(process.cwd(),'../')).filter(item =>item.endsWith('.crt')))):null
    }
  },
  vue: {
    config: {
      productionTip: false,
    }
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  },
  dev: {
    devtools: true
  }
}
