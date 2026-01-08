import {getRequestConfig, getRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
 
// A list of all locales that are supported
const locales = ['en', 'es'];

export default getRequestConfig(async () => {
  // This can be optimized to only load the messages that are really needed.
  const locale = await getRequestLocale();

  if (!locales.includes(locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`./messages/${locale}.json`)).default;
  } catch (error) {
    // Default to 'en' if the message file for a locale is missing for any reason
    messages = (await import('./messages/en.json')).default;
  }
 
  return {
    locale,
    messages
  };
});
