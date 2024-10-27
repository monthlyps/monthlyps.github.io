export async function GET() {
  const svg = await fetch("https://static.solved.ac/tier_small/0.svg")
  return new Response(svg.body)
}
