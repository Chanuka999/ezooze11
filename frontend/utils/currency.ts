import { StoreSettings } from '../types';

const getCurrencySymbol = (currency: StoreSettings['currency']): string => {
    switch (currency) {
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'LKR': return 'Rs.';
        default: return 'Rs.';
    }
};

export const formatPrice = (
    price: number | undefined | null,
    currency: StoreSettings['currency'],
    options: { forceDecimals?: boolean } = {}
) => {
    if (price === null || price === undefined) {
        price = 0;
    }
    const symbol = getCurrencySymbol(currency);
    
    let formatOptions: Intl.NumberFormatOptions = {};
    if (options.forceDecimals) {
        formatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    }
    
    const formattedPrice = price.toLocaleString(undefined, formatOptions);
    
    return `${symbol} ${formattedPrice}`;
};

export const getCurrencySymbolOnly = (currency: StoreSettings['currency']): string => {
    return getCurrencySymbol(currency);
};
