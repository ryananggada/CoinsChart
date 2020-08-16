import { get } from '../api';
import type { Store } from './index';

export type State = {
    +loading: boolean,
    +current: string,
    +list: Array<Coin>
};

type Coin = {
    symbol: string,
    name: string,
    price?: number,
    price24hAgo?: number,
    priceChange?: number
};

type Action =
  | { type: 'LOADING_PRICES' }
  | { type: 'SELECTED_COIN', symbol: string }
  | { type: 'UPDATED_24H_AGO_PRICE', symbol: string, price: number }
  | { type: 'UPDATED_PRICES',
      response: {
        [symbol: string]: {
          ['USD']: number
        }
      }
    };

type GetState = () => Store;
type PromiseAction = Promise<Action>;
type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
type Dispatch = (action: Action | ThunkAction | PromiseAction | Array<Action>) => any;    

const initialState: State = {
    // loading flag to show activity indicator when prices are being updated
    loading: true,
    // Preselect BTC coin
    current: 'BTC',
    // Predefine a list of coins
    list: [
        { symbol: 'BTC', name: 'Bitcoin' },
        { symbol: 'ETH', name: 'Ethereum' },
        { symbol: 'XRP', name: 'Ripple' },
        { symbol: 'LTC', name: 'Litecoin' },
        { symbol: 'ETC', name: 'Ethereum Classic' },
        { symbol: 'DASH',name: 'DigitalCash' },
        { symbol: 'XEM', name: 'NEM' },
        { symbol: 'XMR', name: 'Monero' }
    ],
};

export const selectCoin = (symbol: string): Action => ({
    type: 'SELECTED_COIN',
    symbol
});

export const updatePrices = (): ThunkAction => async (dispatch, getState) => {
    dispatch({ type: 'LOADING_PRICES' });
    const {
        coins: {
            list
        }
    } = getState();
    const symbols = coinsToCommaSeparatedSymbolList(list);
    const response = await get(`data/pricemulti?fsyms=${symbols}&tsyms=USD`);
    dispatch({
        type: 'UPDATED_PRICES',
        response
    });
    // Update 24 hour ago prices for each coin
    list.forEach(coin =>
        dispatch(fetch24hAgoPrice(coin.symbol))
    );
};

export const fetch24hAgoPrice = (symbol: string): ThunkAction => async dispatch => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const timestampYesterday = timestamp - (24 * 3600);
    const response = await get(`data/histohour?fsym=${symbol}&tsym=USD&limit=1&toTs=${timestampYesterday}`);
    if (response.Data.length > 0) {
      // Get last entry's close price in Data array since the API returns two entries
        const price = response.Data.slice(-1).pop().close;
        dispatch({
            type: 'UPDATED_24H_AGO_PRICE',
            symbol,
            price
        });
    }
};

// reducer

export default function reducer(state: State = initialState, action: Action) {
    switch (action.type) {
  
        // Update loading state
        case 'LOADING_PRICES': {
            return {
            ...state,
            loading: true,
            };
        }
    
        // Update all coin prices
        case 'UPDATED_PRICES': {
            const { list } = state;
            const { response } = action;
            return {
            ...state,
            // map through each coin
            list: list.map(coin => ({
                ...coin,
                // to update the prices
                price: response[coin.symbol] ? response[coin.symbol].USD : undefined,
            })),
            loading: false,
            };
        }
    
        // Update 24 hour ago price for a specific coin
        case 'UPDATED_24H_AGO_PRICE': {
            const { list } = state;
            const { symbol, price } = action;
            return {
            ...state,
            // map through each coin
            list: list.map(coin => ({
                ...coin,
                // to find the one that matches
                ...(coin.symbol === symbol ? {
                // and update it's 24 hour ago price
                price24hAgo: price,
                // and the change compared to current price
                priceChange: coin.price ? getPriceChange(coin.price, price) : undefined,
                } : {
                // don't change any values if didn't match
                })
            })),
            };
        }
    
        // Change current coin
        case 'SELECTED_COIN': {
            const { symbol } = action;
            return {
            ...state,
            current: symbol,
            };
        }
    
        default: {
            return state;
        }
    }
};
  
// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
  
// Convert coin array to a comma separated symbol list for the API calls
const coinsToCommaSeparatedSymbolList = (list: Array<Coin>): string => list
    .map(item => item.symbol)
    .reduce((prev, current) => prev + ',' + current);
  
  // Get percentage change between current and previous prices
const getPriceChange = (currentPrice: number, previousPrice: number): number => {
    if (!previousPrice) {
        return 0;
    }
    return parseFloat((((currentPrice / previousPrice) - 1) * 100).toFixed(2));
};