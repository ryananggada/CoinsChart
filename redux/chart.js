import { get } from '../api';
import type { Store } from './index';

export const RANGE_1W = '1W';
export const RANGE_1M = '1M';
export const RANGE_3M = '3M';
export const RANGE_6M = '6M';
export const RANGE_1Y = '1Y';
export const RANGE_3Y = '3Y';
export const RANGE_5Y = '5Y';
export const RANGES = [RANGE_1W, RANGE_1M, RANGE_3M, RANGE_6M, RANGE_1Y, RANGE_3Y, RANGE_5Y];

export type Range = typeof RANGE_1W
  | typeof RANGE_1M
  | typeof RANGE_3M
  | typeof RANGE_6M
  | typeof RANGE_1Y
  | typeof RANGE_3Y
  | typeof RANGE_5Y;

export type State = {
    +loading: boolean,      // activity indicator flag
    +range: Range,          // current date range
    +prices: Array<number> // historical prices
};

type Action =
    | { type: 'LOADING_CHART_PRICES' }
    | { type: 'SELECTED_CHART_RANGE', range: Range }
    | {
    type: 'UPDATED_CHART_PRICES',
    response: {
        Data: Array<{
            close: number,
            high: number,
            low: number,
            open: number,
            time: number,
            volumefrom: number,
            volumeto: number
        }>,
        TimeFrom: number,
        TimeTo: number,
    }
};

type GetState = () => Store;
type PromiseAction = Promise<Action>;
type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
type Dispatch = (action: Action | ThunkAction | PromiseAction | Array<Action>) => any;

const initialState: State = {
    loading: true,  // show activity indicator on first load
    range: '1W',    // default to one week range
    prices: []     // no price data initially
};

export const selectRange = (range: Range): Action => ({
    type: 'SELECTED_CHART_RANGE',
    range
});
  
  // Fetch prices using API and dispatch the data to reducer
export const updateChartPrices = (): ThunkAction => async (dispatch, getState) => {
    dispatch({ type: 'LOADING_CHART_PRICES' });
    const {
        coins: { current },
        chart: { range }
    } = getState();
    const response = await get(buildAPIQuery(current, range));
  
    dispatch({
        type: 'UPDATED_CHART_PRICES',
        response
    });
};

const buildAPIQuery = (symbol: string, range: Range): string => {

    let endpoint = 'histoday';
    let aggregate = 1;
    let limit = 7;
  
    switch (range) {
        case RANGE_1W:
            endpoint = 'histoday';
            aggregate = 1;
            limit = 7;
            break;
        case RANGE_1M:
            endpoint = 'histoday';
            aggregate = 1;
            limit = 30;
            break;
        case RANGE_3M:
            endpoint = 'histoday';
            aggregate = 3;
            limit = 30;
            break;
        case RANGE_6M:
            endpoint = 'histoday';
            aggregate = 6;
            limit = 30;
            break;
        case RANGE_1Y:
            endpoint = 'histoday';
            aggregate = 12;
            limit = 30;
            break;
        case RANGE_3Y:
            endpoint = 'histoday';
            aggregate = 12;
            limit = 90; 
            break;
        case RANGE_5Y:
            endpoint = 'histoday';
            aggregate = 12;
            limit = 150;
            break;
        /*    
        case RANGE_MAX:
            endpoint = 'histoday';
            aggregate = 200;
            limit = 2000; // maximum allowed limit
            break;
        */
    }
  
    return `data/${endpoint}?fsym=${symbol}&tsym=USD&aggregate=${aggregate}&limit=${limit}`;
};

// reducer

export default function reducer(state: State = initialState, action: Action) {
    switch (action.type) {
  
        case 'LOADING_CHART_PRICES': {
            return {
                ...state,
                loading: true
            };
        }
    
        case 'UPDATED_CHART_PRICES': {
            const { response: { Data } } = action;
            return {
                ...state,
                loading: false,
                prices: !!Data ? Data.map(item => item.close) : [] // use closing prices
            };
        }
    
        case 'SELECTED_CHART_RANGE': {
            const { range } = action;
            return {
                ...state,
                range
            };
        }
    
        default: {
            return state;
        }
    }
}