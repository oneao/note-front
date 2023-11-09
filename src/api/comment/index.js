import {get,post,del,put,patch} from '../index'
const CommentApi = {
    //获取所有评论列表
    getComments:(obj) => post(`/comment/getComments`,obj),
    //
    goToLike:(id,isLike) => patch(`/comment/goToLike/${id}/${isLike}`)
}
export default CommentApi;