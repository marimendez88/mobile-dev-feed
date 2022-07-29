<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';
import {XMLParsetoJSONService} from './util/xml-to-json';
export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  },
  setup() {
    const xmlParser = new XMLParsetoJSONService();
    const url = 'https://ionicframework.com/blog/feed/';
    xmlParser.getJson(url).then(data => {
      console.log(data);
    });

  
    return {};
  }
});
</script>