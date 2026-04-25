#include <stdint.h>
#include <stdlib.h>
uint64_t splitmix64(uint64_t *x)
{
    *x = *x + UINT64_C(0x9e3779b97f4a7c15);
    *x = (*x ^ (*x >> 30)) * UINT64_C(0xbf58476d1ce4e5b9);
    *x = (*x ^ (*x >> 27)) * UINT64_C(0x94d049bb133111eb);
    *x = *x ^ (*x >> 31);
    return *x;
}

typedef struct data
{
    int32_t *arr;
    int32_t (*query)[4];
} data;

data generate(int32_t N, int32_t Q, uint64_t seed)
{
    data d;
    d.arr = (int32_t *)calloc(N + 1, sizeof(int32_t));
    d.query = (int32_t(*)[4])calloc(Q + 1, sizeof(int32_t) * 4);
    for (int i = 1; i <= N; i++)
    {
        d.arr[i] = splitmix64(&seed) % 1000000 + 1;
    }
    for (int j = 1; j <= Q; j++)
    {
        int32_t t = splitmix64(&seed) % 4 + 1;
        d.query[j][0] = t;
        int32_t l = splitmix64(&seed) % N + 1;
        int32_t r = splitmix64(&seed) % N + 1;
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
        d.query[j][3] = splitmix64(&seed) % m + 1;
    }
    return d;
}

void free_data(data d)
{
    free(d.arr);
    free(d.query);
}