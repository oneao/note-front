import {get,post} from '../index'
const SmallNoteApi = {
    //获取当前登录用户小记信息
    getSmallNote:(userId) => get(`/smallNote/getInfo?userId=${userId}`)
}
export default SmallNoteApi;