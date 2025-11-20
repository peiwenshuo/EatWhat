/**
 * Safari iOS 兼容性 Polyfills
 *
 * 这个文件包含了所有需要的 polyfills 以确保应用在旧版 Safari 上正常运行
 * 特别是 Safari 14 及以下版本（iOS 14 及以下）
 */

// Object.hasOwn polyfill
// react-markdown v9+ 需要这个方法，但 Safari < 15 不支持
if (typeof Object.hasOwn !== 'function') {
  Object.hasOwn = function(obj: any, prop: PropertyKey): boolean {
    if (obj == null) {
      throw new TypeError('Cannot convert undefined or null to object')
    }
    return Object.prototype.hasOwnProperty.call(obj, prop)
  }
}

// 确保 Promise.allSettled 存在 (Safari < 13 不支持)
if (typeof Promise.allSettled !== 'function') {
  Promise.allSettled = function(promises: any[]) {
    return Promise.all(
      promises.map(promise =>
        Promise.resolve(promise)
          .then(value => ({ status: 'fulfilled' as const, value }))
          .catch(reason => ({ status: 'rejected' as const, reason }))
      )
    )
  }
}

// 确保 String.prototype.replaceAll 存在 (Safari < 13.1 不支持)
if (typeof String.prototype.replaceAll !== 'function') {
  String.prototype.replaceAll = function(this: string, search: string | RegExp, replace: string | ((substring: string, ...args: any[]) => string)): string {
    if (search instanceof RegExp) {
      if (!search.global) {
        throw new TypeError('String.prototype.replaceAll called with a non-global RegExp argument')
      }
      return this.replace(search, replace as any)
    }
    return this.split(search).join(typeof replace === 'string' ? replace : replace(search))
  }
}

console.log('[Polyfills] Safari 兼容性 polyfills 已加载', {
  hasOwn: typeof Object.hasOwn,
  allSettled: typeof Promise.allSettled,
  replaceAll: typeof String.prototype.replaceAll,
})
