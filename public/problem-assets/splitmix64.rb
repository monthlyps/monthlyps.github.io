Data_ = Struct.new(:arr, :query)

def generate(n, q, seed)

    next_int = lambda do ||
    seed = (seed + 0x9e3779b97f4a7c15) & 0xffffffffffffffff
    seed = ((seed ^ (seed >> 30)) * 0xbf58476d1ce4e5b9) & 0xffffffffffffffff
    seed = ((seed ^ (seed >> 27)) * 0x94d049bb133111eb) & 0xffffffffffffffff
    seed = (seed ^ (seed >> 31)) & 0xffffffffffffffff
  end

  # Create 1-based indexed arrays
  arr = Array.new(n + 1, 0)
  query = Array.new(q + 1) { Array.new(4, 0) }

  (1..n).each do |i|
    arr[i] = next_int.call() % 1_000_000 + 1
  end

  (1..q).each do |j|
    t = next_int.call() % 4 + 1
    query[j][0] = t

    l = next_int.call() % n + 1
    r = next_int.call() % n + 1

    l, r = r, l if l > r

    query[j][1] = l
    query[j][2] = r

    m = t <= 2 ? 1_000_000 : 998_244_353
    query[j][3] = next_int.call() % m + 1
  end

  Data_.new(arr, query)
end
