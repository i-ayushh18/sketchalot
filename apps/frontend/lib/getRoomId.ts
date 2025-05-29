export async function getRoomId(slug: string): Promise<string> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${slug}`);
  
    if (!res.ok) {
      throw new Error(`Failed to fetch roomId for slug: ${slug}`);
    }
  
    const data = await res.json();
    return data.id;
}
  