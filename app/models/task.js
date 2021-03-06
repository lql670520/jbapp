import {list, remove, create, detail, update} from '../services/task';
import {DEFAULT_PAGE_SIZE} from '../constants/config';

export default {
  namespace: 'task',

  state: {
    pagedList: [],
    list: [],
    filter: {},
    selectedRowKeys: [],
    pagination: {
      total: 0,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    },
    currentItem: {},
    // compareItem:{},
    editType: 'create',
    sorter: {
      field: 'mdtime',
      order: 'desc',
    },
  },

  effects: {
    *list({payload = {}}, {call, put, select}) {
      const {page, pageSize, all, sorter, ...filter} = payload;

      // 获取简单的下拉列表数据的情况
      if (all === true) {
        const {data} = yield call(list, {
          all: true,
          ...filter,
        });

        yield put({
          type: 'updateState',
          payload: {list: data},
        });
        return;
      }

      // 获取分页列表数据的情况
      const prevPagination = yield select(state => state.task.pagination);
      const prevFilter = yield select(state => state.task.filter);
      const prevSorter = yield select(state => state.task.sorter);

      const nextFilter = {...prevFilter, ...filter};
      const nextPagination = {
        ...prevPagination,
        page: page || prevPagination.page,
        pageSize: pageSize || prevPagination.pageSize,
      };
      const nextSorter = {...prevSorter, ...sorter};
      yield put({
        type: 'updateState',
        payload: {
          filter: nextFilter,
          pagination: nextPagination,
          sorter: nextSorter,
        },
      });

      const {pagination, data} = yield call(list, {
        ...nextFilter,
        page: nextPagination.page,
        pageSize: nextPagination.pageSize,
        sortBy: nextSorter.field,
        sortOr: nextSorter.order,
      });

      yield put({
        type: 'updateState',
        payload: {
          //   pagedList: data,
          pagedList: pagination.total == 0 ? [] : data,
          pagination: {...nextPagination, ...pagination},
        },
      });
    },

    *goCreate({payload}, {call, put, select}) {
      yield put({
        type: 'updateState',
        payload: {
          editType: 'create',
          currentItem: {},
        },
      });
      yield put(routerRedux.push(edit_url));
    },

    *create({payload}, {call, put, select}) {
      const result = yield call(create, payload);
      if (result.success != false) {
        yield put({
          type: 'global/toast',
          payload: {
            type: 'success',
            message: '新增成功！',
          },
        });
        router.goBack();
      }
    },

    *update({payload}, {call, put, select}) {
      const {id} = yield select(state => state.task.currentItem);
      const result = yield call(update, {id, ...payload});
      if (result.success != false) {
        yield put({
          type: 'global/notify',
          payload: {
            type: 'success',
            message: '修改成功',
          },
        });
        return true;
      } else {
        return false;
      }
    },

    *goUpdate({payload, isDetail}, {call, put, select}) {
      yield put(routerRedux.push(edit_url));
      const {data} = yield call(detail, {id: payload.id});
      yield put({
        type: 'updateState',
        payload: {
          editType: isDetail ? 'detail' : 'update',
          currentItem: data,
        },
      });
    },

    *remove({payload}, {call, put, select}) {
      const result = yield call(remove, payload.ids);
      if (result.success != false) {
        yield put({
          type: 'list',
        });
      }
    },
  },

  reducers: {
    updateState(state, {payload}) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
