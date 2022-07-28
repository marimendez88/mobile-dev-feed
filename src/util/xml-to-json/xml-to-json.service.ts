import { XMLParser } from 'fast-xml-parser';
import { RSSFeedI, SingleItemI } from './models';

export class XMLParsetoJSONService {

	public getJson = async (endpoint: string) : Promise<RSSFeedI> => {
		try {
			const mediaItems: string[] = [
				'content:encoded',
				'podcast:transcript',
				'itunes:summary',
				'itunes:author',
				'itunes:explicit',
				'itunes:duration',
				'itunes:season',
				'itunes:episode',
				'itunes:episodeType',
				'itunes:image',
			];
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

          const rss: RSSFeedI = {
            title: RSSContent?.title ?? '',
            description: RSSContent.description ?? '',
            link:
              RSSContent.link && RSSContent.link.href ? RSSContent.link.href : RSSContent.link,
            image: RSSContent.image
              ? RSSContent.image.url
              : RSSContent['itunes:image']
                ? RSSContent['itunes:image'].href
                : '',
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

            /** Search for content  */
            let content = '';
            if (currentValue?.content?.$t) content = currentValue?.content?.$t;
            else if (currentValue?.description?.$t) content = currentValue?.description.$t;
            else if (currentValue?.summary?.$t) content = currentValue?.summary.$t;
            else if (currentValue?.description?.$cdata) content = currentValue?.description.$cdata;
            else if (currentValue['content:encoded']) content = currentValue['content:encoded'];

            /** Search for Publish date */
            let published = '';
            if (currentValue?.created) published = currentValue?.created;
            else if (currentValue?.pubDate) published = currentValue?.pubDate;
            else if (currentValue?.published) published = currentValue?.published;
            else if (currentValue?.updated) published = currentValue?.updated;


            const obj: SingleItemI = {
              id: itemId,
              title: currentValue?.title && currentValue?.title.$text ? currentValue?.title.$text : currentValue?.title,
              description:
                currentValue?.summary && currentValue?.summary.$text
                  ? currentValue?.summary.$text
                  : currentValue?.description,
              link: currentValue?.link && currentValue?.link.href ? currentValue?.link.href : currentValue?.link,
              author:
                currentValue?.author && currentValue?.author.name ? currentValue?.author.name : currentValue['dc:creator'],
              published: published, 
              created: currentValue?.updated
                ? Date.parse(currentValue?.updated)
                : currentValue?.pubDate
                  ? Date.parse(currentValue?.pubDate)
                  : currentValue?.created
                    ? Date.parse(currentValue?.created)
                    : Date.now(),
              category: currentValue?.category || [],
              content:content,
              enclosures: currentValue?.enclosure
                ? Array.isArray(currentValue?.enclosure)
                  ? currentValue?.enclosure
                  : [currentValue?.enclosure]
                : [],
            };
  
            mediaItems.forEach((s) => {
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
  
            rss.items.push(obj);
            console.warn(rss);
          }
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
