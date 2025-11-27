import api from "@services/api";

const CLASS_BASE_PATH = "/api/v1/classes";

const getClasses = (params = {}) => api.get(CLASS_BASE_PATH, { params });
const getClassesPaging = (params = {}) =>
  api.get(`${CLASS_BASE_PATH}/paging`, { params });
const getClassDetail = (id) =>
  api.get(`${CLASS_BASE_PATH}/detail`, { params: { id } });
const addClass = (data) => api.post(CLASS_BASE_PATH, data);
const updateClass = (id, data) => api.put(`${CLASS_BASE_PATH}/${id}`, data);
const deleteClass = (id) => api.delete(`${CLASS_BASE_PATH}/${id}`);

export const classService = {
  getClasses,
  getClassesPaging,
  getClassDetail,
  addClass,
  updateClass,
  deleteClass,
  // Backward compatibility helpers (legacy names still used in some files)
  getAllClasses: (params) => getClasses(params),
  createClass: (data) => addClass(data),
};

export default classService;
