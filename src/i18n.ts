import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  let messages;
  switch (locale) {
    case 'en':
      messages = (await import('../messages/en.json')).default;
      break;
    case 'es':
      messages = (await import('../messages/es.json')).default;
      break;
    default:
      messages = (await import('../messages/en.json')).default;
  }
 
  return {
    messages
  };
});
