import { defineStore } from 'pinia'
import { Option, RSSFeedI } from '@/models/'
import { XMLParsetoJSONService } from '@/util/xml-to-json'
import { userSelection, feedStoreName } from '@/store/constants'
// You can name the return value of `defineStore()` anything you want, but it's best to use the name of the store and surround it with `use` and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application
export const FeedStore = defineStore(feedStoreName, {

  state: () => ({
    availabeRSSFeed: [] as RSSFeedI [],
    usrsOptionsSelected: userSelection as Option [],
  }),
  actions: {
    fetchAvailableRSSFeeds() {
      const _XMLParsetoJSONService = new XMLParsetoJSONService();
      userSelection.forEach(async (option) => {
        const rssFeed: RSSFeedI = await _XMLParsetoJSONService.getJson(option.url);
        console.log(rssFeed);
        this.addAvailableRSSFeed(rssFeed);
      });
    },
    addAvailableRSSFeed(rssFeed: RSSFeedI) {
      this.availabeRSSFeed.push(rssFeed);
      console.log(this.availabeRSSFeed);
    },
    addUserSelection() {
      // *do nothing
    },
    updteUserSelection() { 
      // *do nothing
    },
  },
  getters: {
    getAvailableRSSFeed(state) {
      return state.availabeRSSFeed
    }
  }
})