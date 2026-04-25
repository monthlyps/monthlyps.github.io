
class Data {

    public static class Splitmix64 {

        private long seed;

        public Splitmix64(long seed) {
            this.seed = seed;
        }

        private long splitmix64() {
            seed = seed + 0x9e3779b97f4a7c15L;
            seed = (seed ^ (seed >>> 30)) * 0xbf58476d1ce4e5b9L;
            seed = (seed ^ (seed >>> 27)) * 0x94d049bb133111ebL;
            seed = seed ^ (seed >>> 31);
            return seed;
        }

        public int next(int modulo) {
            return (int) Long.remainderUnsigned(splitmix64(), modulo) + 1;
        }
    }

    public int[] arr;
    public int[][] query;

    public Data(int[] arr, int[][] query) {
        this.arr = arr;
        this.query = query;
    }

    public static Data generate(int n, int q, long seed) {
        Splitmix64 splitmix64 = new Splitmix64(seed);
        int[] arr = new int[n + 1];
        int[][] query = new int[q + 1][4];

        for (int i = 1; i <= n; i++) {
            arr[i] = splitmix64.next(1_000_000);
        }

        for (int j = 1; j <= q; j++) {
            int t = splitmix64.next(4);
            query[j][0] = t;

            int l = splitmix64.next(n);
            int r = splitmix64.next(n);

            if (l > r) {
                int tmp = l;
                l = r;
                r = tmp;
            }

            query[j][1] = l;
            query[j][2] = r;

            int m = t <= 2 ? 1_000_000 : 998_244_353;
            query[j][3] = splitmix64.next(m);
        }

        return new Data(arr, query);
    }
}
