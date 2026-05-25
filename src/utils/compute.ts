import BigNumber from 'bignumber.js';

type Value = string | number;

export function isEqual(a: Value, b: Value) {
  const localA = new BigNumber(a);
  return localA.isEqualTo(b);
}

export function paramType(a: Value): string {
  let num = typeof a === 'string' ? a.replace(/,/g, '') : a.toString();
  if (
    !num ||
    isNaN(Number(num)) ||
    num === '' ||
    (typeof num === 'string' && num.indexOf('e') > -1)
  ) {
    num = '0';
  }
  return num;
}

/**
 * 加
 * @param a
 * @param b
 * @returns
 */
export const numberAdd = (a: Value, b: Value) => {
  const bn1 = new BigNumber(paramType(a));
  const bn2 = new BigNumber(paramType(b));
  const c = bn1.plus(bn2);

  return c.toFixed();
};

export const numberAdd2 = (a: Value, b: Value) => {
  const bn1 = new BigNumber(paramType(a));
  const bn2 = new BigNumber(paramType(b));
  const c = bn1.plus(bn2);

  return c;
};

/**
 * 减
 * @param a
 * @param b
 * @returns
 */
export const numberMinus = (a: Value, b: Value) => {
  const bn1 = new BigNumber(paramType(a));
  const bn2 = new BigNumber(paramType(b));
  const c = bn1.minus(bn2);

  return c.toFixed();
};

/**
 * 乘
 * @param a
 * @param b
 * @returns
 */
export const numberMultiply = (a: Value, b: Value, decimalPlaces?: number) => {
  const bn1 = new BigNumber(paramType(a));
  const bn2 = new BigNumber(paramType(b));
  const c = bn1.multipliedBy(bn2);

  return c.toFixed(decimalPlaces ?? 0);
};

export const numberMultiply2 = (a: Value, b: Value) => {
  const bn1 = new BigNumber(paramType(a));
  const bn2 = new BigNumber(paramType(b));
  const c = bn1.multipliedBy(bn2);

  return c;
};

export const numberMultiplyToFixed = (
  num1: Value,
  num2: Value,
  decimals = 2,
) => {
  const bigNum1 = new BigNumber(paramType(num1));
  const bigNum2 = new BigNumber(paramType(num2));
  const result = bigNum1.times(bigNum2);
  const res = result.toFixed(decimals);
  return res;
};

/**
 * 除
 * @param a
 * @param b
 * @returns
 */
export const numberDivide = (a: Value, b: Value) => {
  const bn1 = new BigNumber(paramType(a));
  const bn2 = new BigNumber(paramType(b));
  const c = bn1.dividedBy(bn2);

  return c.toFixed();
};

export const removeDecimalZero = (num: string) => {
  let newStr = num;
  let len = num.length - num.indexOf('.') - 1;
  if (num.indexOf('.') > -1) {
    for (let i = len; i > 0; i--) {
      if (
        newStr.lastIndexOf('0') > -1 &&
        newStr.substr(newStr.length - 1, 1) === '0'
      ) {
        let k = newStr.lastIndexOf('0');
        if (newStr.charAt(k - 1) === '.') {
          return newStr.substring(0, k - 1);
        } else {
          newStr = newStr.substring(0, k);
        }
      } else {
        return newStr;
      }
    }
  }
  return num;
};

export const formatNumberCutZero = (a: Value, decimalPlace: number = 8) => {
  const value = numberMultiply(a, 1) as any;
  if (isNaN(value)) {
    return '';
  }
  const num = new BigNumber(value).toFormat(decimalPlace);
  return removeDecimalZero(num);
};

export const formatNumberCutZeroNoFormat = (
  a: Value,
  decimalPlace: number = 8,
) => {
  const value = numberMultiply(a, 1) as any;
  if (isNaN(value)) {
    return '';
  }
  const num = new BigNumber(value).toFixed(decimalPlace);
  return removeDecimalZero(num);
};

export const fixedNumberCutZero = (a: Value, decimalPlace: number = 8) => {
  if (a === '') return '';
  const value = numberMultiply(a, 1) as any;
  if (isNaN(value)) {
    return '0';
  }
  const num = new BigNumber(value).toFixed(decimalPlace);
  return removeDecimalZero(num);
};

export const comparedTo = (a: Value, b: Value) => {
  let bn1 = new BigNumber(paramType(a));
  let bn2 = new BigNumber(paramType(b));
  return bn1.comparedTo(bn2);
};

export const fixedDecimalPlaces = (
  a: BigNumber.Value,
  decimalPlaces: number,
) => {
  return new BigNumber(a).toFixed(decimalPlaces);
};

export const fixed4DecimalPlaces = (a: BigNumber.Value) => {
  return fixedDecimalPlaces(a, 4);
};

export const fixed2DecimalPlaces = (a: BigNumber.Value) => {
  return fixedDecimalPlaces(a, 2);
};

export const fixed8DecimalPlaces = (a: BigNumber.Value) => {
  return fixedDecimalPlaces(a, 8);
};

export const legitInputNumber = (val: Value, decimalLength: number) => {
  const splitVal = val.toString().split('.');
  const oneDigit =
    splitVal.length > 1
      ? `${splitVal[0]}.${splitVal[1]?.slice(0, decimalLength)}`
      : splitVal[0];

  const bNumberInstance = new BigNumber(oneDigit);
  const stringBNumber = bNumberInstance.toString();
  if (stringBNumber === 'NaN') {
    return 0;
  } else {
    return bNumberInstance.toFixed(decimalLength);
  }
};

export const getDecimalPlaces = (val: Value) => {
  const splitVal = val.toString().split('.');

  if (splitVal.length >= 2) {
    return splitVal[1].length;
  } else {
    return 0;
  }
};

export const formatNumber = (a: Value, decimalPlace = 4) => {
  let value: Value = numberMultiply(a, 1);
  if (value.toString() === 'NaN') {
    value = 0;
  }
  return new BigNumber(value).toFormat(decimalPlace);
};

export const numberSum = (arr: any[], dp = 4) => {
  if (arr.length === 0) return 0;
  return BigNumber.sum(
    ...arr.map((item) => new BigNumber(paramType(item))),
  ).toFixed(dp);
};

export function isNullOrEmpty(value: any) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '')
  );
}

export function isZeroLike(value: number | string) {
  if (isNullOrEmpty(value)) {
    return true;
  }

  const n = new BigNumber(value);

  if (n.isNaN()) {
    return true;
  }

  if (n.isEqualTo(0)) {
    return true;
  }
}

export const calcUnitByQuantity = (
  quantity: number,
  conversionFactor: number,
) => {
  if (isNullOrEmpty(quantity) || isNullOrEmpty(conversionFactor)) {
    return {
      packagingUnit: undefined,
      baseUnit: undefined,
    };
  }

  if (quantity === Infinity) {
    return {
      packagingUnit: Infinity,
      baseUnit: Infinity,
    };
  }

  if (quantity > conversionFactor) {
    const int = Math.floor(quantity / conversionFactor);
    const float = quantity % conversionFactor;
    return {
      packagingUnit: int,
      baseUnit: float,
    };
  } else if (quantity === conversionFactor) {
    return {
      packagingUnit: 1,
      baseUnit: 0,
    };
  } else {
    return {
      packagingUnit: 0,
      baseUnit: quantity,
    };
  }
};
