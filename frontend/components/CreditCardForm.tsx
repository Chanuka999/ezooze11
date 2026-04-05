
import React, { useState, useEffect } from 'react';
import { VisaIcon, MastercardIcon, AmexIcon, CardChipIcon, LockClosedIcon } from './icons';

interface CreditCardFormProps {
  onPaymentDataChange: (data: { cardNumber: string; cardName: string; expiryDate: string; cvc: string }) => void;
  onValidityChange: (isValid: boolean) => void;
}

interface FormErrors {
    cardNumber?: string;
    cardName?: string;
    expiryDate?: string;
    cvc?: string;
}

// Luhn algorithm check
const isValidLuhn = (cardNumber: string): boolean => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i), 10);
        if (shouldDouble) {
            if ((digit *= 2) > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0;
};

export const CreditCardForm: React.FC<CreditCardFormProps> = ({ onPaymentDataChange, onValidityChange }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<'cardNumber' | 'cardName' | 'expiryDate' | 'cvc' | null>(null);


  useEffect(() => {
    const rawCardNumber = cardNumber.replace(/\s/g, '');
    const expiryDate = `${expiryMonth}/${expiryYear}`;
    onPaymentDataChange({ cardNumber: rawCardNumber, cardName, expiryDate, cvc });

    const validateAll = () => {
        const hasErrors = Object.values(errors).some(error => error !== undefined);
        const areFieldsFilled = rawCardNumber && cardName && expiryMonth && expiryYear && cvc;
        onValidityChange(!hasErrors && !!areFieldsFilled);
    }
    validateAll();

  }, [cardNumber, cardName, expiryMonth, expiryYear, cvc, onPaymentDataChange, errors, onValidityChange]);

  useEffect(() => {
    const rawCardNumber = cardNumber.replace(/\s/g, '');
    if (rawCardNumber.startsWith('4')) {
      setCardType('visa');
    } else if (/^5[1-5]/.test(rawCardNumber)) {
      setCardType('mastercard');
    } else if (/^3[47]/.test(rawCardNumber)) {
      setCardType('amex');
    } else {
      setCardType(null);
    }
  }, [cardNumber]);
  
  const validateAndSet = (field: keyof FormErrors, value: any, validationFn: () => string | undefined) => {
    // This is a generic update function that can be used for any field
    // For this implementation, we will stick to specific handlers for clarity
  };


  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    const limit = cardType === 'amex' ? 15 : 16;
    value = value.substring(0, limit);
    
    let formattedValue;
    if (cardType === 'amex') {
        formattedValue = value.replace(/(\d{4})(\d{6})?(\d{5})?/, '$1 $2 $3').trim();
    } else {
        formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
    }
    setCardNumber(formattedValue);
    
    // Real-time validation
    const rawCardNumber = value;
    if (rawCardNumber.length > 0) {
        if ((cardType === 'amex' && rawCardNumber.length === 15) || (cardType !== 'amex' && rawCardNumber.length === 16)) {
            if (!isValidLuhn(rawCardNumber)) {
                setErrors(prev => ({...prev, cardNumber: 'Invalid card number.'}));
            } else {
                setErrors(prev => ({...prev, cardNumber: undefined}));
            }
        } else {
             setErrors(prev => ({...prev, cardNumber: undefined})); // Clear error while typing
        }
    } else {
        setErrors(prev => ({...prev, cardNumber: 'Card number is required.'}));
    }
  };
  
  const handleExpiryMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2);
    setExpiryMonth(value);
  }
  
  const handleExpiryYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2);
    setExpiryYear(value);
  }

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    const limit = cardType === 'amex' ? 4 : 3;
    if (value.length > limit) value = value.slice(0, limit);
    setCvc(value);
  };
  
  const handleBlur = (field: keyof FormErrors) => {
    const newErrors: FormErrors = {...errors};

    if (field === 'cardNumber') {
        const rawCardNumber = cardNumber.replace(/\s/g, '');
        if (!rawCardNumber) {
            newErrors.cardNumber = 'Card number is required.';
        } else if (cardType === 'amex' && rawCardNumber.length !== 15) {
            newErrors.cardNumber = 'American Express requires 15 digits.';
        } else if (cardType !== 'amex' && rawCardNumber.length > 0 && rawCardNumber.length !== 16) {
            newErrors.cardNumber = 'Card number must be 16 digits.';
        } else if (rawCardNumber.length > 0 && !isValidLuhn(rawCardNumber)) {
            newErrors.cardNumber = 'Invalid card number.';
        } else {
            delete newErrors.cardNumber;
        }
    }
    
    if (field === 'cardName' && !cardName) {
        newErrors.cardName = 'Cardholder name is required.';
    } else if (field === 'cardName') {
        delete newErrors.cardName;
    }

    if (field === 'expiryDate') {
        if (!expiryMonth || !expiryYear) {
            newErrors.expiryDate = 'Full expiry date is required.';
        } else {
            const month = parseInt(expiryMonth, 10);
            const year = parseInt(expiryYear, 10);
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = new Date().getMonth() + 1;
            if (month < 1 || month > 12) {
                newErrors.expiryDate = 'Invalid month.';
            } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                newErrors.expiryDate = 'Card has expired.';
            } else {
                delete newErrors.expiryDate;
            }
        }
    }

    if (field === 'cvc') {
        const cvcLength = cardType === 'amex' ? 4 : 3;
        if (!cvc) {
            newErrors.cvc = 'CVC is required.';
        } else if (cvc.length !== cvcLength) {
            newErrors.cvc = `Must be ${cvcLength} digits.`;
        } else {
            delete newErrors.cvc;
        }
    }

    setErrors(newErrors);
    setFocusedField(null);
  };


  const getCardTypeIcon = (isLarge = false) => {
    const className = isLarge ? "h-8" : "h-6";
    switch (cardType) {
      case 'visa': return <VisaIcon className={className} />;
      case 'mastercard': return <MastercardIcon className={className} />;
      case 'amex': return <AmexIcon className={className} />;
      default: return <div className={className} />;
    }
  };

  const inputClasses = "block w-full border rounded-md shadow-sm sm:text-sm p-2 bg-brand-light-gray dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white";
  const normalBorder = "border-gray-300 dark:border-gray-600 focus:ring-brand-gold focus:border-brand-gold";
  const errorBorder = "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";
  const highlightClass = 'bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.3)] border border-white/20';


  return (
    <div className="w-full max-w-md mx-auto">
        <div className="perspective-1000">
            <div className={`w-full h-56 rounded-xl relative transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-2xl backface-hidden p-6 flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                        <CardChipIcon className="h-10 w-10" />
                        {getCardTypeIcon(true)}
                    </div>
                    <div className={`rounded-md -m-2 p-2 transition-all duration-300 ${focusedField === 'cardNumber' ? highlightClass : ''}`}>
                        <p className="font-mono text-xl tracking-widest">
                            {cardNumber || '#### #### #### ####'}
                        </p>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className={`rounded-md -m-2 p-2 transition-all duration-300 ${focusedField === 'cardName' ? highlightClass : ''}`}>
                            <p className="text-xs uppercase">Card Holder</p>
                            <p className="font-medium tracking-wider truncate">{cardName || 'FULL NAME'}</p>
                        </div>
                        <div className={`rounded-md -m-2 p-2 text-right transition-all duration-300 ${focusedField === 'expiryDate' ? highlightClass : ''}`}>
                            <p className="text-xs uppercase">Expires</p>
                            <p className="font-medium tracking-wider">{expiryMonth || 'MM'}/{expiryYear || 'YY'}</p>
                        </div>
                    </div>
                </div>
                
                <div className="absolute w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl shadow-2xl backface-hidden rotate-y-180 p-4 flex flex-col justify-start text-white">
                    <div className="w-full h-12 bg-black mt-4"></div>
                     <div className={`mt-4 text-right rounded-md p-2 transition-all duration-300 ${focusedField === 'cvc' ? `${highlightClass} animate-pulseGlow` : ''}`}>
                        <p className="text-xs uppercase mb-1">CVC</p>
                        <div className="w-full h-8 bg-gray-200 rounded-sm flex items-center justify-end px-2">
                           <p className="text-black font-mono italic">{cvc}</p>
                        </div>
                    </div>
                    <div className="mt-auto text-xs text-gray-300 flex items-center justify-end">
                        <LockClosedIcon className="h-4 w-4 mr-1" />
                        <span>Secure Transaction</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 space-y-4">
            <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Number</label>
                <div className="relative mt-1">
                    <input type="text" id="cardNumber" value={cardNumber} onChange={handleCardNumberChange} onFocus={() => setFocusedField('cardNumber')} onBlur={() => handleBlur('cardNumber')} className={`${inputClasses} ${errors.cardNumber ? errorBorder : normalBorder}`} placeholder="0000 0000 0000 0000" required />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {getCardTypeIcon()}
                    </div>
                </div>
                {errors.cardNumber && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.cardNumber}</p>}
            </div>
            <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cardholder Name</label>
                <input type="text" id="cardName" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} onFocus={() => setFocusedField('cardName')} onBlur={() => handleBlur('cardName')} className={`mt-1 ${inputClasses} ${errors.cardName ? errorBorder : normalBorder}`} placeholder="John Doe" required />
                {errors.cardName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.cardName}</p>}
            </div>
            <div className="flex space-x-4">
                <div className="flex-1">
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiration Date</label>
                    <div className="flex items-center mt-1">
                        <input type="text" id="expiryMonth" value={expiryMonth} onChange={handleExpiryMonthChange} onFocus={() => setFocusedField('expiryDate')} onBlur={() => handleBlur('expiryDate')} className={`${inputClasses} rounded-r-none text-center ${errors.expiryDate ? errorBorder : normalBorder}`} placeholder="MM" required />
                        <span className="inline-flex items-center px-3 border-t border-b sm:text-sm text-gray-500 bg-brand-light-gray dark:bg-gray-700 border-gray-300 dark:border-gray-600">/</span>
                        <input type="text" id="expiryYear" value={expiryYear} onChange={handleExpiryYearChange} onFocus={() => setFocusedField('expiryDate')} onBlur={() => handleBlur('expiryDate')} className={`${inputClasses} rounded-l-none text-center ${errors.expiryDate ? errorBorder : normalBorder}`} placeholder="YY" required />
                    </div>
                    {errors.expiryDate && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.expiryDate}</p>}
                </div>
                <div className="w-1/3">
                    <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVC</label>
                    <input type="text" id="cvc" value={cvc} onChange={handleCvcChange} onFocus={() => { setIsFlipped(true); setFocusedField('cvc'); }} onBlur={() => { setIsFlipped(false); handleBlur('cvc'); }} className={`mt-1 ${inputClasses} text-center ${errors.cvc ? errorBorder : normalBorder}`} placeholder={cardType === 'amex' ? '1234' : '123'} required />
                    {errors.cvc && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.cvc}</p>}
                </div>
            </div>
        </div>
    </div>
  );
};
