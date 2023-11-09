import {get, post, del, put, patch} from '../index'
const CommentUserApi = {
    //添加评论用户
    addCommentUser:(obj) => post(`/commentUser/addCommentUser`,obj),
    //获取点赞信息
    getCommentUserLikes:(id) => get(`/commentUser/getCommentUserLikes?id=${id}`),
    //点赞
    goToLikes:(id,likeIds) => patch(`/commentUser/goToLikes/${id}/${likeIds}`)
}
export default CommentUserApi;