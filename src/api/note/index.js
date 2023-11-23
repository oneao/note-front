import {get, post, del, put,patch} from '../index'

const NoteApi = {
    //获取当前登录用户笔记信息
    getNoteInfo: () => get(`/note/getNoteInfo`),
    //验证用户笔记密码是否正确
    verifyNoteLockPassword: (obj) => post(`/note/verifyNoteLockPassword`, obj),
    //彻底删除笔记密码
    completelyLiftedNoteLockPassword: (obj) => put(`/note/completelyLiftedNoteLockPassword`, obj),
    //添加用户笔记密码
    addNoteLockPassword: (obj) => post(`/note/addNoteLockPassword`, obj),
    //修改笔记的置顶状态
    changeNoteTopStatus: (obj) => post(`/note/changeNoteTopStatus`, obj),
    //删除小记
    deleteNote: (obj) => del(`/note/deleteNote`, obj),
    //新增笔记
    addNote: () => get(`/note/addNote`),
    //获取单个笔记
    getOneNote: (noteId) => get(`/note/getOneNote/${noteId}`),
    //修改笔记的内容
    updateNoteContent: (obj) => put(`/note/updateNoteContent`, obj),
    //更新笔记的信息
    updateNoteMessage: (obj) => put(`/note/updateNoteMessage`, obj),
    //收藏笔记
    updateNoteCollection: (obj) => put(`/note/updateNoteCollection`, obj),
    //判断分享的笔记是否已经分享过了
    getNoteIsShare: (noteId) => get(`/noteShare/getNoteIsShare?noteId=${noteId}`),
    //保存分享笔记的内容
    addNoteShare: (obj) => post(`/noteShare/addNoteShare`, obj),
    //获取分享笔记（这个接口只有ShareNoteLayout页面使用）
    getShareNote: (obj) => post(`/noteShare/getShareNote`, obj),
    //判断分享的笔记是否需要锁
    getShareNoteIsLock: (n_sid) => get(`/noteShare/getShareNoteIsLock?n_sid=${n_sid}`),
    //点赞或取消点赞
    goToLick: (obj) => put(`/noteShare/goToLick`, obj),
    //获取收藏笔记
    getCollectionNote: (obj) => post(`/note/getCollectionNote`,obj),
    //取消收藏笔记
    cancelCollectionNote:(noteId) =>patch(`/note/cancelCollectionNote/${noteId}`),
    //批量取消收藏笔记
    batchCancelCollectionNotes:(obj) => patch(`/note/batchCancelCollectionNotes`,obj),
    //获取所有的分享笔记
    getShareNoteAll:(obj) => post(`/noteShare/getShareNoteAll`,obj),
    //取消分享一个笔记
    cancelShareNote:(id) => patch(`/noteShare/cancelShareNote/${id}`),
    //修改一个笔记的分享时常
    updateShareNoteDay:(obj) => post(`/noteShare/updateShareNoteDay`,obj),
    //为分享的笔记添加访问密码
    addShareNoteLock:(obj) => post(`/noteShare/addShareNoteLock`,obj),
    //取消分享密码
    delShareNoteLock:(obj) => post(`/noteShare/delShareNoteLock`,obj),
    //编辑分享笔记的内容
    updateShareNoteContent:(obj) => post(`/noteShare/updateShareNoteContent`,obj),
    //获取笔记信息
    getElasticSearchValue:(value) => get(`/note/getElasticSearchValue?value=${value}`),

}
export default NoteApi;