// 示例方法，没有实际意义
export function trim(str: string) {
  return str.trim();
}

// 去掉字符串前后的空格，同时将中间的连续空格保留一个
export const formatString = (str: string) => {
  if (typeof str !== 'string') {
    return str;
  }
  // 去掉前后空格
  let result = str.trim();

  // 将中间的多个空格替换为一个空格
  result = result.replace(/\s+/g, ' ');

  return result;
};

// 去掉字符串前所有的空格
export const removeStringSpace = (str: string) => {
  if (typeof str !== 'string') {
    return str;
  }
  return str.replace(/\s+/g, '');
};
