import {get,post} from '../index'
const SmallNoteApi = {
    //获取当前登录用户小记信息
    getSmallNote:(userId) => get(`/smallNote/getInfo?userId=${userId}`),
    //改变小记的置顶与否的状态
    changeSmallNoteTopStatus:(smallNoteTopStatusObj) => post('/smallNote/changeSmallNoteStatus',smallNoteTopStatusObj)
}
export default SmallNoteApi;