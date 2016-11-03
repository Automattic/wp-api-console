import { isArray, isPlainObject, isString, toPairs, toString } from 'lodash';

const MAX_LENGTH = 60;

const recursiveStringify = (data, max = MAX_LENGTH) => {
  if (isPlainObject(data) || isArray(data)) {
    const pairs = toPairs(data);

    let output = isArray(data) ? '[' : '{';
    let trailing = "";
    let length = 1;
    for(let [ key, value ] of pairs) {
      output += trailing;
      output += '<span class="key">"' + key + '"</span>:';
      const recursion = recursiveStringify(value);
      output += recursion.output;
      length += key.toString().length + 2 + trailing.length + recursion.length;
      trailing = ", ";
      if (length > max) {
        output += isArray(data) ? " …]" : " …}";
        return {
          length: length + 3,
          output
        }
      }
    }
    return {
      output: output + (isArray(data) ? "]" : "}"),
      length: length + 1
    };
  }

  if (isString(data)) {
    return {
      length: data.length + 2,
      output: '<span class="string">"' + data.replace(/"/g, "\\\"") + '"</span>'
    };
  }

  return {
    length: toString(data).length,
    output: '<span class="' + (typeof data) + '">' + data + '</span>'
  };
}

export const stringify = (data, max = MAX_LENGTH) =>
  recursiveStringify(data, max).output
