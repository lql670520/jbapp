import {list} from '../services/message';
import {DEFAULT_PAGE_SIZE} from '../constants/config';

export default {
  namespace: 'message',

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
      const prevPagination = yield select(state => state.message.pagination);
      const prevFilter = yield select(state => state.message.filter);
      const prevSorter = yield select(state => state.message.sorter);

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
