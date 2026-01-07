import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // This can be optimized to only load the messages that are really needed.
  let messages;
  try {
    messages = (await import(`./src/messages/${locale}.json`)).default;
  } catch (error) {
    messages = (await import('./src/messages/en.json')).default;
  }
 
  return {
    locale,
    messages
  };
});
