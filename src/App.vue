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


    const asynctest = async () => {

// https://blog.teamtreehouse.com/feed

      const url = 'https://ionicframework.com/blog/feed/';
      const response = (await xmlParser.getJson(url));
      xmlParser.getJson(url).then(function(response) {
        console.log(response);
      });
      console.error('MJ component', response);
      return response;
    }
    asynctest();
    // console.log(asynctest());


  
    return {};
  }
});
</script>