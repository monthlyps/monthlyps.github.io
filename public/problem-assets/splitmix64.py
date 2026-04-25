import dataclasses

@dataclasses.dataclass
class Data:
    arr: list[int]
    query: list[list[int]]

def generate(n: int, q: int, seed: int) -> Data:
    def splitmix64():
        nonlocal seed
        seed = (seed + 0x9e3779b97f4a7c15) & 0xffffffffffffffff
        seed = ((seed ^ (seed >> 30)) * 0xbf58476d1ce4e5b9) & 0xffffffffffffffff
        seed = ((seed ^ (seed >> 27)) * 0x94d049bb133111eb) & 0xffffffffffffffff
        seed = seed ^ (seed >> 31)
        return seed

    arr = [0] * (n + 1)
    query = [[0] * 4 for _ in range(q + 1)]

    for i in range(1, n + 1):
        arr[i] = (splitmix64() % 1_000_000) + 1

    for j in range(1, q + 1):
        t = (splitmix64() % 4) + 1
        query[j][0] = t

        l = (splitmix64() % n) + 1
        r = (splitmix64() % n) + 1

        if l > r:
            l, r = r, l

        query[j][1] = l
        query[j][2] = r

        m = 1_000_000 if t <= 2 else 998_244_353
        query[j][3] = (splitmix64() % m) + 1

    return Data(arr, query)
