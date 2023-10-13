import {get,post} from '../index'

const UserApi = {
    //登录
    userLogin:({email,password}) => post(`/user/login`,{email,password}),
    //获取验证码
    getCode:(email) => get(`/user/getCode?email=${email}`),
    //注册
    userRegister:({email,password,code}) => post(`/user/register`,{email,password,code}),
    //退出
    userSignOut:() => get(`/user/signOut`)
}
export default UserApi;