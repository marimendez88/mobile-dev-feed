import { XMLParser } from 'fast-xml-parser';
import { RSSFeedI, SingleItemI } from './models';
import { mediaPossibleKeyItems} from './constants';

export class XMLParsetoJSONService {

	public getJson = async (endpoint: string) : Promise<RSSFeedI> => {
		try {

return  fetch(endpoint).then((res) => {
        res.text().then((data) => {
          const xml = new XMLParser({
            attributeNamePrefix: '',
            textNodeName: '$text',
            ignoreAttributes: false,
          });


          const result = xml.parse(data);

          let RSSContent =
            result.rss && result.rss.channel ? result.rss.channel : result.feed;
          
          if (Array.isArray(RSSContent)) RSSContent = RSSContent[0];

          /** Get RSS link */
          let RSSLink = '';
          if(RSSContent.link?.href) RSSLink = RSSContent.link.href;
          if (RSSContent.link) RSSLink = RSSContent.link;
          /** Get RSS Image */
          let RSSImage = '';
          if (RSSContent.image && RSSContent.image?.url) RSSImage = RSSContent.image.url;
          else if(RSSContent['itunes:image']) RSSImage = RSSContent['itunes:image'];


          const rss: RSSFeedI = {
            title: RSSContent?.title ?? '',
            description: RSSContent?.description ?? '',
            link:RSSLink  ,
            image: RSSImage,
            category: RSSContent.category || [],
            items:RSSContent.items || [],
          };
  
          let items = RSSContent.item || RSSContent.entry || [];
          if (items && !Array.isArray(items)) items = [items];

          for (let i = 0; i < items.length; i++) {
            const currentValue = items[i];
            const media = {};


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
  
            mediaPossibleKeyItems?.forEach((s) => {
              if (currentValue[s]) obj[s.replace(':', '_')] = currentValue[s];
            });
  
            if (currentValue['media:thumbnail']) {
              Object.assign(media, { thumbnail: currentValue['media:thumbnail'] });
              obj.enclosures.push(currentValue['media:thumbnail']);
            }
  
            if (currentValue['media:content']) {
              Object.assign(media, { thumbnail: currentValue['media:content'] });
              obj.enclosures.push(currentValue['media:content']);
            }
  
            if (currentValue['media:group']) {
              if (currentValue['media:group']['media:title'])
                obj.title = currentValue['media:group']['media:title'];
  
              if (currentValue['media:group']['media:description'])
                obj.description = currentValue['media:group']['media:description'];
  
              if (currentValue['media:group']['media:thumbnail'])
                obj.enclosures.push(currentValue['media:group']['media:thumbnail'].url);
            }
  
            Object.assign(obj, { media });

            rss.items = [...rss.items, obj];
            Array.isArray((obj.category))  ? rss.category.push(...obj.category) : rss.category.push(obj.category);
          }
          // * Remove string duplicates from array
          rss.category = [...new Set(rss?.category)];
          return rss;
        });
      }).catch((err) => {
        return err;
      });
    }
    catch (err) {
      return err as any;
    }
  }
}
