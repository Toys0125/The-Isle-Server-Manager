<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <div class="text-center">
        <logo />
        <vuetify-logo />
      </div>
      <v-card>
        <v-card-title class="headline">
          Welcome to the Isle Management Injector Tool
        </v-card-title>
        <v-card-text>
          <p></p>
          <p>
            For more information on Isle Management Injector Tool
            <a
              href="https://github.com/Toys0125/The-Isle-Server-Manager"
              target="_blank"
            >
              GitHub </a
            >.
          </p>
          <p>
            Find a bug? Report it on the github
            <a
              href="https://github.com/Toys0125/The-Isle-Server-Manager/issues"
              target="_blank"
              title="contribute"
            >
              issue board </a
            >.
          </p>
          <p>Thank you for visting the Isle Management Injector Tool Website</p>
          <div class="text-xs-right">
            <em><small>&mdash; @Toys0125</small></em>
          </div>
          <hr class="my-3" />
          <a href="https://nuxtjs.org/" target="_blank">
            Nuxt Documentation
          </a>
          <br />
          <a href="https://github.com/nuxt/nuxt.js" target="_blank">
            Nuxt GitHub
          </a>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <dir v-if="!isUserLoggedIn()">
            <v-btn color="primary" nuxt to="/login">
              Login
            </v-btn>
          </dir>
          <dir v-else>
            <v-btn color="primary" nuxt to="/edit">Edit Players </v-btn>
            <dir v-if="isAdminAccount()">
              <v-btn color="primary" nuxt to="/users"
                >Edit Management Accounts
              </v-btn>
            </dir>
          </dir>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Logo from "~/components/Logo.vue";
import VuetifyLogo from "~/components/VuetifyLogo.vue";

export default {
  components: {
    Logo,
    VuetifyLogo
  },
  methods: {
    isUserLoggedIn() {
      //console.log("Is the user logged in",this.$auth.loggedIn)
      return this.$auth.loggedIn;
    },
    isAdminAccount() {
      if (
        this.$auth.$storage.getUniversal("scope").includes("Admin") ||
        this.$auth.$storage.getUniversal("scope").includes("Master")
      ) {
        return true;
      } else return false;
    }
  }
};
</script>
