import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // Provide a static path to the messages directory
  const messages = (await import(`../messages/${locale}.json`)).default;
 
  return {
    messages
  };
});
