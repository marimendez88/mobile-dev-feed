import { XMLParser } from 'fast-xml-parser';
import { RSSFeedI, SingleItemI } from '../../models';

export class XMLParsetoJSONService {

	public getJson = async (endpoint: string) : Promise<RSSFeedI> => {
		try {

return await fetch(endpoint).then(async (res) => {
        return await res.text().then(async (data) => {
          const xml = new XMLParser({
            attributeNamePrefix: '',
            textNodeName: '$text',
            ignoreAttributes: false,
          });
          const result = xml.parse(data);
          console.log('result',result); 
          const RSSContent = result.rss && result.rss.channel ? result.rss.channel : result.feed;
          const newRSS: RSSFeedI = this.getRSSFeed(RSSContent);
          let items = RSSContent.item || RSSContent.entry || [];
          if (items && !Array.isArray(items)) items = [items];
          newRSS.items = this.getFeedItems(items);
          return newRSS;
        })
      }).catch((err) => {
        return err;
      });
    }
    catch (err) {
      return err as any;
    }
  }

  private getRSSFeed(RSSContent: any): RSSFeedI {
  
        if (Array.isArray(RSSContent)) RSSContent = RSSContent[0];
        /** Get RSS link */
        let RSSLink = '';
        if(RSSContent.link?.href) RSSLink = RSSContent.link.href;
        if (RSSContent.link) RSSLink = RSSContent.link;
        /** Get RSS Image */
        let RSSImage = '';
        if (RSSContent.image && RSSContent.image?.url) RSSImage = RSSContent.image.url;
        else if(RSSContent['itunes:image']) RSSImage = RSSContent['itunes:image'];
      const newRSSContent:RSSFeedI = {
        title: RSSContent?.title ?? '',
        description: RSSContent?.description ?? '',
        link:RSSLink  ,
        image: RSSImage,
        category: RSSContent.category || [],
        items:RSSContent.items || [],
      };
          return newRSSContent;
    
  }


  private  getFeedItems(items: any[]) {
  const newItems =  items.map( (item: any) => { 

    const currentValue = item;

      /** Search for Item ID */
      let itemId = '';
      if (currentValue?.guid?.$t) itemId = currentValue?.guid.$t;
      else if ( currentValue['post-id']?.$text) itemId =  currentValue['post-id'].$text;
      else if (currentValue?.id) itemId = currentValue?.id;

      /** Search for Item Title */
      let itemTitle = '';
      if (currentValue?.title?.$text) itemTitle = currentValue?.title.$text;
      else if (currentValue?.title) itemTitle = currentValue?.title;
      
      /** Search for item description */
      let itemDescription = '';
      if (currentValue?.description?.$text) itemDescription = currentValue?.description.$text;
      else if(currentValue?.summary?.$text) itemDescription = currentValue?.summary.$text;

      /** Search for content  */
      let content = '';
      if (currentValue?.content?.$t) content = currentValue?.content?.$t;
      else if (currentValue?.description?.$t) content = currentValue?.description.$t;
      else if (currentValue?.summary?.$t) content = currentValue?.summary.$t;
      else if (currentValue?.description?.$cdata) content = currentValue?.description.$cdata;
      else if (currentValue['content:encoded']) content = currentValue['content:encoded'];

      let itemLink = '';
      if (currentValue?.link?.$href) itemLink = currentValue?.link.$href;
      else if (currentValue?.link) itemLink = currentValue?.link;
        
      /** Search for Publish date */
      let published = '';
      if (currentValue?.created) published = currentValue?.created;
      else if (currentValue?.pubDate) published = currentValue?.pubDate;
      else if (currentValue?.published) published = currentValue?.published;
      else if (currentValue?.updated) published = currentValue?.updated;

      /** Search for author */
      let itemAuthor = '';
      if (currentValue?.author?.$name) itemAuthor = currentValue?.author.$name;
      else if (currentValue?.author) itemAuthor = currentValue?.author.name;
      else if( currentValue['dc:creator']) itemAuthor = currentValue['dc:creator'];

      /** Search for date created */
      let itemCreated = '';
      if (currentValue?.updated) itemCreated = currentValue?.updated;
      else if (currentValue?.pubDate) itemCreated = currentValue?.pubDate;
      else if (currentValue?.created) itemCreated = currentValue?.created;
      /** Search for enclosures */
      let enclosures = [];
      if (currentValue?.enclosure) enclosures = currentValue?.enclosure;
      else if (Array.isArray(currentValue?.enclosure)) enclosures = [currentValue?.enclosure];

      const obj: SingleItemI = {
        id: itemId,
        title: itemTitle,
        description: itemDescription,
        link: itemLink,
        author: itemAuthor,
        published: published, 
        created: itemCreated ,
        category: currentValue?.category || [],
        content:content,
        enclosures: enclosures,
      };
    return obj;
  });
    return newItems;
  }
}
