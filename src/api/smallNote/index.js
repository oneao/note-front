import {get,post,del} from '../index'
const SmallNoteApi = {
    //获取当前登录用户小记信息
    getSmallNote:(pageObj) => post(`/smallNote/getInfo`,pageObj),
    //改变小记的置顶与否的状态
    changeSmallNoteTopStatus:(smallNoteTopStatusObj) => post('/smallNote/changeSmallNoteStatus',smallNoteTopStatusObj),
    //逻辑删除小记
    deleteSmallNote : (delObj) => del(`/smallNote/deleteSmallNote`,delObj),
    //新增小记
    addSmallNote : (addObj) => post(`/smallNote/addSmallNote`,addObj),
    //获取单个小记
    getOneSmallNote : (id) => get(`/smallNote/getOneSmallNote?id=${id}`),
    //更新小记
    updateSmallNote : (obj) => post(`/smallNote/updateSmallNote`,obj)
}
export default SmallNoteApi;