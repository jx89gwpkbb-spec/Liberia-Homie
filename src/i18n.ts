import {getRequestConfig} from 'next-intl/server';
 
// A list of all locales that are supported
const locales = ['en', 'es'];

export default getRequestConfig(async ({locale}) => {
  // This can be optimized to only load the messages that are really needed.
  let messages;
  try {
    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(locale as any)) {
      locale = 'en'; // Default to 'en' if locale is invalid
    }
    messages = (await import(`./messages/${locale}.json`)).default;
  } catch (error) {
    // Also default to 'en' if the message file for a locale is missing
    messages = (await import('./messages/en.json')).default;
    locale = 'en';
  }
 
  return {
    locale,
    messages
  };
});
