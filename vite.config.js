import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

//自动引入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {NaiveUiResolver} from 'unplugin-vue-components/resolvers'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(),
        AutoImport({
            imports: [
                'vue',
                {
                    'naive-ui': [
                        'useDialog',
                        'useMessage',
                        'useNotification',
                        'useLoadingBar'
                    ]
                }
            ]
        }),
        Components({
            resolvers: [NaiveUiResolver()]
        }),

    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server : {
        proxy : {
            '/note-serve' : {
                target : 'http://127.0.0.1:8080/note',
                changeOrigin:true,
                rewrite:path => path.replace(/^\/note-serve/,'')
            },
            "/img" : {
                target : 'http://127.0.0.1:8080/note',
                changeOrigin:true,
                rewrite:path => path.replace(/^\/note-serve/,'')
            },
            "/openai" : {
                target : 'http://127.0.0.1:8080/note',
                changeOrigin:true,
                rewrite:path => path.replace(/^\/note-serve/,'')
            },
        }
    }
})
