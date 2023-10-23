import {get,post,del,put} from '../index'
const NoteApi = {
    //获取当前登录用户笔记信息
    getNoteInfo:() => get(`/note/getNoteInfo`),
    //验证用户笔记密码是否正确
    verifyNoteLockPassword:(obj) => post(`/note/verifyNoteLockPassword`,obj),
    //彻底解除笔记密码
    completelyLiftedNoteLockPassword:(obj) => put(`/note/completelyLiftedNoteLockPassword`,obj),
    //添加用户笔记密码
    addNoteLockPassword:(obj) => post(`/note/addNoteLockPassword`,obj),
    //修改笔记的置顶状态
    changeNoteTopStatus:(obj) => post(`/note/changeNoteTopStatus`,obj),
    //删除小记
    deleteNote:(obj) => del(`/note/deleteNote`,obj),
    //新增笔记
    addNote:() => get(`/note/addNote`),
    //获取单个笔记
    getOneNote:(noteId) => get(`/note/getOneNote/${noteId}`),
    //检查该笔记是否上锁,上锁的话就删除redis中的值
    removeAccessToNote:(noteId) => get(`/note/removeAccessToNote/${noteId}`),
    //修改笔记的内容
    updateNoteContent:(obj) => put(`/note/updateNoteContent`,obj)
}
export default NoteApi;