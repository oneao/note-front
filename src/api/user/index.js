import {get,post,put} from '../index'

const UserApi = {
    //登录
    userLogin:({email,password}) => post(`/user/login`,{email,password}),
    //获取验证码
    getCode:(email) => get(`/user/getCode?email=${email}`),
    //注册
    userRegister:({email,password,code}) => post(`/user/register`,{email,password,code}),
    //退出
    userSignOut:() => get(`/user/signOut`),
    //获取用户的基本信息
    getUserInfo:() => get(`/user/getUserInfo`),
    //更新用户基本信息
    updateUserMessage:(obj) => put(`/user/updateUserMessage`,obj),
    //获取用户事件线日志信息
    getUserTimeLine:() => get(`/user/getUserTimeLine`),
    //重置密码
    toResetPassword:(obj) => put(`/user/toResetPassword`,obj),
    //获取忘记密码中的验证码
    getForgetCode:(email) => get(`/user/getForgetCode?email=${email}`),
    //修改忘记的密码
    updateForgetPassword:(obj) => put(`/user/updateForgetPassword`,obj),

}
export default UserApi;