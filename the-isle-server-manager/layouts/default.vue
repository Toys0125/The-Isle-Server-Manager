<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
        <dir v-if="!logedIn">
          <v-list-item
            to="/edit"
          >
            <v-list-item-action>
              <v-icon>mdi-fountain-pen-tip</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Edit</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </dir>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <!-- <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon>mdi-{{ `chevron-${miniVariant ? "right" : "left"}` }}</v-icon>
      </v-btn>
      <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-btn icon @click.stop="fixed = !fixed">
        <v-icon>mdi-minus</v-icon>
      </v-btn> -->
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <!-- <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn> -->
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-snackbar
      v-model="snackBar"
      :color="snackBarColor"
      :ulti-line="mode === 'multi-line'"
      :timeout="snackBarTimeout"
      :vertical="mode === 'vertical'"
    >{{ snackBarText }}</v-snackbar>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2019 by Toys0125 (CC-BY-NC-SA-4.0)</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: "mdi-apps",
          title: "Welcome",
          to: "/"
        },
        {
          icon: "mdi-chart-bubble",
          title: "Inspire",
          to: "/inspire"
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "The Isle Server Manager",
      logedIn: false,
      snackBarText: "Success!",
      snackBar: false,
      snackBarColor: "green",
      snackBarTimeout: 2000,
      defaultSnackBarTimeout: 2000,
      defaultSuccessSnackBarText: "Success!",
      defaultSuccessSnackBarColor: "green",
      mode: ""
    };
  },
  mounted(){
    this.$root.$on("showSnackbar", snackbarOptions => {
      this.snackBarColor =
        snackbarOptions.color === ""
          ? this.defaultSuccessSnackBarColor
          : snackbarOptions.color
      this.snackBarText =
        snackbarOptions.text === ""
          ? this.defaultSuccessSnackBarText
          : snackbarOptions.text;
      this.snackBarTimeout = parseInt(
        snackbarOptions.timeout === "" || snackbarOptions.timeout === 0
          ? this.defaultSnackBarTimeout
          : snackbarOptions.timeout
      );
      this.snackBar = true
  })
  }
};
</script>
