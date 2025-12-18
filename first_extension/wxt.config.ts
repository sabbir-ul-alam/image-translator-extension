import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
     srcDir: 'src',
     manifest: {
          name: 'On-Page Translator',
          description: 'Select an area, Ocr it, translate it',
          permissions: ['activeTab','scripting','storage'],
          host_permissions:['<all_urls>'],

          commands: {
               START_SELECTION: {
                    description: 'Start area selection for translation',
                    suggested_key: {
                         default: 'Ctrl+Z',
                         mac: 'Command+Z',
                    },
               },
          },
     },
     dev:{
          server:{
               port: 3000
          }
     }
});
