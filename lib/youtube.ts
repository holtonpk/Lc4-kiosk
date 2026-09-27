// Videos are stored as {title, url}; a url that parses as a YouTube link is
// played through an embed, anything else is an uploaded file.

const ID = /^[\w-]{11}$/;

export function youTubeId(url: string): string | null {
  const raw = url.trim();
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www\.|m\.|music\.)/, "");
  let id: string | null = null;
  if (host === "youtu.be") {
    id = u.pathname.slice(1).split("/")[0];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, kind, rest] = u.pathname.split("/");
    id = kind === "watch" ? u.searchParams.get("v") : ["embed", "shorts", "live", "v"].includes(kind) ? rest : null;
  }
  return id && ID.test(id) ? id : null;
}

export function youTubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youTubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

// Privacy-enhanced embed with YouTube chrome kept to a minimum: no annotations,
// related videos limited to the same channel, white progress bar.
export function youTubeEmbed(id: string, {autoplay = false} = {}): string {
  const params = new URLSearchParams({
    rel: "0",
    playsinline: "1",
    iv_load_policy: "3",
    color: "white",
    ...(autoplay && {autoplay: "1"}),
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}
