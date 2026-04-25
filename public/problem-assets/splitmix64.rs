pub struct Data {
    pub arr: Vec<usize>,
    pub query: Vec<[usize; 4]>,
}

pub fn generate(n: usize, q: usize, mut seed: u64) -> Data {
    let mut splitmix64 = || {
        seed = seed.wrapping_add(0x9e3779b97f4a7c15_u64);
        seed = (seed ^ (seed >> 30)).wrapping_mul(0xbf58476d1ce4e5b9_u64);
        seed = (seed ^ (seed >> 27)).wrapping_mul(0x94d049bb133111eb_u64);
        seed = seed ^ (seed >> 31);
        seed
    };

    let mut arr = vec![0; n + 1];
    let mut query = vec![[0; 4]; q + 1];

    for v in arr.iter_mut().skip(1) {
        *v = (splitmix64() % 1_000_000) as usize + 1;
    }

    for v in query.iter_mut().skip(1) {
        let t = (splitmix64() % 4) as usize + 1;
        v[0] = t;

        let mut l = (splitmix64() % n as u64) as usize + 1;
        let mut r = (splitmix64() % n as u64) as usize + 1;

        if l > r {
            std::mem::swap(&mut l, &mut r);
        }

        v[1] = l;
        v[2] = r;

        let m = if t <= 2 { 1_000_000 } else { 998_244_353 };
        v[3] = (splitmix64() % m as u64) as usize + 1;
    }

    Data { arr, query }
}
