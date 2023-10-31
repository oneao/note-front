import {get,post,del,put} from '../index'
const RecycleBinApi = {
    getRecycleBin:(obj) =>post(`/recycle/getRecycleBin`,obj),
    recoverOneRecord:(obj) => put(`/recycle/recoverOneRecord`,obj),
    deleteMany:(obj) => del(`/recycle/deleteMany`,obj),
    recoverMany:(obj) => put(`/recycle/recoverMany`,obj)
}
export default RecycleBinApi;