class Data {
  constructor(arr, query) {
    this.arr = arr
    this.query = query
  }
}

function generate(n, q, seed) {
  const nb = BigInt(n)

  function splitmix64() {
    seed = BigInt.asUintN(64, seed + 0x9e3779b97f4a7c15n)
    seed = BigInt.asUintN(64, (seed ^ (seed >> 30n)) * 0xbf58476d1ce4e5b9n)
    seed = BigInt.asUintN(64, (seed ^ (seed >> 27n)) * 0x94d049bb133111ebn)
    seed = BigInt.asUintN(64, seed ^ (seed >> 31n))
    return seed
  }

  const arr = new Array(n + 1).fill(0)
  const query = Array.from({ length: q + 1 }, () => new Array(4).fill(0))

  for (let i = 1; i <= n; i++) {
    arr[i] = Number(splitmix64() % 1000000n) + 1
  }

  for (let j = 1; j <= q; j++) {
    const t = Number(splitmix64() % 4n) + 1
    query[j][0] = t

    let l = Number(splitmix64() % nb) + 1
    let r = Number(splitmix64() % nb) + 1

    if (l > r) {
      ;[l, r] = [r, l]
    }

    query[j][1] = l
    query[j][2] = r

    const m = t <= 2 ? 1000000n : 998244353n
    query[j][3] = Number(splitmix64() % m) + 1
  }

  return new Data(arr, query)
}
