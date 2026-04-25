#include <cstdint>
#include <vector>
#include <array>

struct Data
{
    std::vector<int32_t> arr;
    std::vector<std::array<int32_t, 4>> query;
};

Data Generate(int32_t N, int32_t Q, uint64_t seed)
{
    Data d;
    d.arr.resize(N+1);
    d.query.resize(Q+1);

    auto splitmix64 = [&seed]
    {
        seed = seed + UINT64_C(0x9e3779b97f4a7c15);
        seed = (seed ^ (seed >> 30)) * UINT64_C(0xbf58476d1ce4e5b9);
        seed = (seed ^ (seed >> 27)) * UINT64_C(0x94d049bb133111eb);
        seed = seed ^ (seed >> 31);
        return seed;
    };

    for (int i = 1; i <= N; i++)
    {
        d.arr[i] = splitmix64() % 1000000 + 1;
    }
    for (int j = 1; j <= Q; j++)
    {
        int32_t t = splitmix64() % 4 + 1;
        d.query[j][0] = t;
        int32_t l = splitmix64() % N + 1;
        int32_t r = splitmix64() % N + 1;
        if (l > r)
        {
            int32_t t = l;
            l = r;
            r = t;
        }
        d.query[j][1] = l;
        d.query[j][2] = r;
        int32_t m;
        if (t <= 2)
        {
            m = 1000000;
        }
        else
        {
            m = 998244353;
        }
        d.query[j][3] = splitmix64() % m + 1;
    }
    return d;
}