
export abstract class Profiler {
  /**
   * Generate Unique key for an entity using the given format
   * @param entity {any}
   * @param format {string} parenthesis grouped key parts format
   *
   * ### Format:
   * `(prop{start, len}) | hash(prop1, prop2,...){len} | (prop{start,len}=val1)`
   *
   * * `(prop{start, len})` : extracts substring of property given the start and length
   * * `hash(prop1, prop2,...){len}` : generate hash number from the given props with length (len)
   * * `(prop{start,len}=val1)` : compares substring of property with val1 and assigns 1 if true, and 0 otherwise.
   *
   * @example
   * ```ts
   *  const profile = {
   *      firstName: 'Muhammad Ibrahim',
   *      lastName: 'Lucman',
   *      middleName: 'Sadic',
   *      gender: 'Male',
   *      birthDate: '03/20/1983'
   *  };
   *  const key = profiler.encodeKey(profile,
   *      '(firstName{0,1})' +
   *      '(lastName{0,1})' +
   *      '(middleName{0,1})' +
   *      'hash(firstName,lastName,middleName , gender, birthDate){12}' +
   *      '(gender{0,1}=M)' +
   *      '(birthDate{8,2})' +
   *      '(birthDate{0,2})' +
   *      '(birthDate{3,2})'
   *  );
   *  //returns 'MLS5392940200001130320'
   * ```
   * @returns {string} constructed key from given entity and format
   */
  static encodeKey<T>(entity: T, format: string): string {
    const patternExp = /(hash|)\(([^\)]+)\)(\{\d+\}|)/;
    const matches = format.match(new RegExp(patternExp, 'g'));
    let key = format;
    for (let index = 0; matches && index < matches.length; index++) {
      const match = patternExp.exec(matches[index]) || [];
      const pattern = match[2];
      const substrPattern = /(?<prop>.*)\s*\{\s*(?<start>\d+)\s*,\s*(?<len>\d+)\s*\}$/.exec(pattern);
      if (substrPattern) {
        const prop = substrPattern.groups?.prop || '';
        const start = Number(substrPattern.groups?.start || '0');
        const len = Number(substrPattern.groups?.len || '1');
        const propVal = Profiler.getProp(entity, prop);
        key = key.replace(matches[index], String(propVal || '').substring(start, start + len).padEnd(len, '_'));
      } else if (pattern.match(/=/)) {
        const [prop, val] = pattern.split(/\s*=\s*/) || ['', ''];
        const condPattern = /(?<prop>.*)\s*\{\s*(?<start>\d+)\s*,\s*(?<len>\d+)\s*\}$/.exec(prop);
        if (!condPattern) throw 'Invalid Profiler Conditional Expression';
        const propVal = Profiler.getProp(entity, condPattern.groups?.prop || '');
        const start = Number(condPattern.groups?.start || '0');
        const len = Number(condPattern.groups?.len || '1');
        key = key.replace(matches[index], (propVal.substring(start, len) == val ? '1' : '0'));
      } else if (match[1] === 'hash') {
        const props = (match[2] || '').split(/\s*,\s*/);
        const len = Number((/\{\s*(\d+)\s*\}/.exec(match[3]) || [])[1]);
        const hashName = Profiler.hashName(props.reduce((prev, curProp) => {
          return prev + Profiler.getProp(entity, curProp);
        }, '').toUpperCase()).toString();
        key = key.replace(matches[index], hashName.padEnd(len, '0').substring(0, len))
      }
      else {
        throw 'Invalid Profiler Encoding Format';
      }
    }
    return key.toUpperCase();
  }
  decodeKey(key: string, format: string) {
    const patternExp = /(hash|)\(([^\)]+)\)(\{\d+\}|)/;
    const matches = format.match(new RegExp(patternExp, 'g'));
    const entity = {};
    let cursor = 0;
    for (let index = 0; matches && index < matches.length; index++) {
      const match = patternExp.exec(matches[index]) || [];
      const pattern = match[2];
      const substrPattern = /(?<prop>.*)\s*\{\s*(?<start>\d+)\s*,\s*(?<len>\d+)\s*\}$/.exec(pattern);
      if (substrPattern) {
        const prop = substrPattern.groups?.prop || '';
        const start = Number(substrPattern.groups?.start || '0');
        const len = Number(substrPattern.groups?.len || '1');
        const propVal = key.substring(cursor, cursor + len);
        Profiler.setProp(entity, prop, propVal, start);
        cursor = cursor + len;
      } else if (pattern.match(/=/)) {
        const [prop, val] = pattern.split(/\s*=\s*/) || ['', ''];
        const condPattern = /(?<prop>.*)\s*\{\s*(?<start>\d+)\s*,\s*(?<len>\d+)\s*\}$/.exec(prop);
        if (!condPattern) throw 'Invalid Profiler Conditional Expression';
        const start = Number(condPattern.groups?.start || '0');
        const len = Number(condPattern.groups?.len || '1');
        const propName = condPattern.groups?.prop || '';
        const propVal = key.substring(cursor, cursor + len);
        Profiler.setProp(entity, propName, propVal == '1' ? val : propVal, start);
        cursor = cursor + len;
      } else if (match[1] === 'hash') {
        const len = Number((/\{\s*(\d+)\s*\}/.exec(match[3]) || [])[1]);
        const propVal = key.substring(cursor, cursor + len);
        Profiler.setProp(entity, 'hash', propVal);
        cursor += len;
      }
      else {
        throw 'Invalid Profiler Encoding Format';
      }
    }
    return entity;
  }
  private static setProp(entity: Record<string, string>, prop: string, value: string, start?: number) {
    const nestedProps = prop.split('.');
    start = start || 0;
    if (nestedProps.length > 1) {
      const [parentProp] = nestedProps.splice(0, 1)
      const subEntity = (entity)[parentProp] || {};
      (entity as unknown as Record<string, unknown>)[parentProp] = subEntity;
      subEntity && Profiler.setProp(subEntity, nestedProps.join('.'), value, start);
    } else {
      const oldVal = (entity as unknown as Record<string, string>)[prop];
      if (typeof oldVal == 'string' || start > 0) {
        const val = oldVal as string || '';
        let valAr = val.split('');
        valAr[start] = value[0];
        valAr = valAr.fill(' ', val.length, start);
        valAr.splice(start, value.length, ...value.split(''));
        (entity as unknown as Record<string, string>)[prop] = valAr.map((c: string) => (c || ' ')).join('');
      } else {
        (entity as unknown as Record<string, string>)[prop] = (value || '').replace(/[_]+$/, '');
      }
    }
  }
  private static getProp<T>(entity: T, prop: string): string {
    const nestedProps = prop.split('.');
    if (nestedProps.length > 1) {
      const [parentProp] = nestedProps.splice(0, 1)
      const subEntity = (entity as unknown as Record<string, string>)[parentProp];
      return subEntity && Profiler.getProp(subEntity, nestedProps.join('.')) || '';
    }
    return (entity as unknown as Record<string, string>)[prop] as string;
  }
  public static hashName(name: string) {
    let hash = 0;
    if (name.length == 0) return hash;
    for (let i = 0; i < name.length; i++) {
      const chr = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash = hash & hash;
    }
    return hash;
  }
}
