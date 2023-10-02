export default function abRedisKey(a: string, b: string) : string{

  if (/%/.test(a)) {
    a = decodeURIComponent(a);
  }

  if (/%/.test(b)) {
    b = decodeURIComponent(b);
  }

  if (a > b) {
    return abRedisKey(b, a);
  }

  return `${a}\t${b}`.toLowerCase()
}
