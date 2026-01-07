import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // This can be optimized to only load the messages that are really needed.
  let messages;
  switch (locale) {
    case 'en':
      messages = (await import('./src/messages/en.json')).default;
      break;
    case 'es':
      messages = (await import('./src/messages/es.json')).default;
      break;
    default:
      messages = (await import('./src/messages/en.json')).default;
  }
 
  return {
    messages
  };
});
