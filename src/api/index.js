import axios from "axios";
import {handOffModalStore} from '@/stores/loginModalStore';
import {createDiscreteApi} from 'naive-ui'
import {useUserStore} from '@/stores/userStore'
import {storeToRefs} from "pinia";

//axios配置
axios.defaults.baseURL = '/note-serve'
axios.defaults.timeout = 10000;
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
//请求拦截器
axios.interceptors.request.use(function (config) {
    //console.log(config.url)
    //对特定请求路径进行拦截
    //需要拦截的路径，可以在此处对请求的路径进行拦截处理
    if( config.url === '/user/login' ||
        config.url.startsWith('/user/getCode') ||
        config.url === '/user/register' ||
        config.url === '/noteShare/getShareNote' ||
        config.url === '/noteShare/goToLick' ||
        config.url.startsWith('/noteShare/getShareNoteIsLock') ||
        config.url.startsWith('/openai') ||
        config.url.startsWith('/comment') ||
        config.url.startsWith('/commentUser')
    ){
    }else{
        let token = JSON.parse(window.localStorage.getItem("user")).token;
        let userInfo = window.localStorage.getItem("user")
        if (token === null || token === '' || userInfo === null || userInfo === '') {
            const { message, notification, dialog, loadingBar } = createDiscreteApi(
                ['message']
            )
            message.error('尚未登录，请先登录')
            const {changeModalStatus} = handOffModalStore();
            changeModalStatus(true)
            if(userInfo){
                const {resetUserInfo} = useUserStore();
                resetUserInfo();
            }
            throw '登录'
        }else if (userInfo){
            //在请求头中添加信息
            //在请求头中添加信息
            config.headers['Authorization'] = 'Bearer ' + token
            config.headers['id'] = JSON.parse(userInfo).id
        }
    }
    //注意：需要返回
    return config;
}, function (err) {
    console.log('请求错误:' + err)
})

axios.interceptors.response.use(function (resp) {
    //对指定的应答结果进行处理
    if(resp && resp.data.code === 50000){
        //此时token无效，需要显示登录
        const { message, notification, dialog, loadingBar } = createDiscreteApi(
            ['message']
        )
        message.error(resp.data.message)
        const {changeModalStatus} = handOffModalStore();
        changeModalStatus(true)
    }
    //window.location.reload();//强制刷新页面
    //注意需要返回
    return resp
},function (err){
    //拦截器错误，返回首页
    console.log('拦截器错误:'+err)
    //window.location.href = '/'
})
/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function get(url, params) {
    return new Promise((resolve, reject) => {
        axios.get(url, params).then(res => {
            resolve(res);
        }).catch(err => {
            reject(err)
        })
    });
}


/**
 * post方法，对应post请求
 * @param url
 * @param params
 */
export function post(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios.post(url, params)
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err)
            })
    });
}
/**
 * delete，对应delete请求
 * @param url
 * @param params
 */
export function del(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios.delete(url, { data: params })
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
    });
}

/**
 * put请求
 * @param url
 * @param params
 * @returns {Promise<unknown>}
 */
export function put(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios.put(url, params)
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
    });
}
/**
 * patch请求
 * @param url
 * @param params
 * @returns {Promise<unknown>}
 */
export function patch(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios.patch(url, params)
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
    });
}
