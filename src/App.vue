<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';
import { parse } from 'rss-to-json';
export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  },
  setup() {


    const asynctest =  () => {

      const response =  parse('http://blog.teamtreehouse.com/feed');
      console.log('MJ response', response);
      console.log('MJ json', JSON.stringify(response, null, 3));

      return response;
    }
    asynctest();
    // console.log(asynctest());


  
    return {};
  }
});
</script>