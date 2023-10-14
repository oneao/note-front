import {get,post,del} from '../index'
const SmallNoteApi = {
    //获取当前登录用户小记信息
    getSmallNote:(pageObj) => post(`/smallNote/getInfo`,pageObj),
    //改变小记的置顶与否的状态
    changeSmallNoteTopStatus:(smallNoteTopStatusObj) => post('/smallNote/changeSmallNoteStatus',smallNoteTopStatusObj),
    //逻辑删除小记
    deleteSmallNote : (delObj) => del(`/smallNote/deleteSmallNote`,delObj),
}
export default SmallNoteApi;