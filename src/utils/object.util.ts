export class ObjectUtil {
  static copyObject<T = unknown>(source: T) {
    return JSON.parse(JSON.stringify(source)) as T;
  }
  static keyOf(data?: { key?: string } | string): string {
    return (typeof data == 'object' ? data.key : data) ?? '';
  }
}
