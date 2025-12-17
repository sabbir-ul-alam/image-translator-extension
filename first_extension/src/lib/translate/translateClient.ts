export async function translateText(
  text: string,
  targetLang: string
): Promise<string> {
//   const encoded = encodeURIComponent(text);
  console.log('Translating text:', text);

//   return "test translation";
//   const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=DE|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${text}&langpair=DE|${targetLang}`;

  const res = await fetch(url);


  console.log('Translation response:', res);

  if (!res.ok) {
    throw new Error('Translation failed');
  }

  const data = await res.json();
  console.log('Translation data:', data.responseData.translatedText);

  return data.responseData.translatedText;
}
