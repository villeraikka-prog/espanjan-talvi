const LEGACY_HOST = "espanjan-talvi.pages.dev";
const PRIMARY_ORIGIN = "https://espanjan-talvi.netlify.app";

export async function onRequest({ request, next }) {
  const source = new URL(request.url);
  if (source.hostname !== LEGACY_HOST) return next();

  const destination = new URL(`${source.pathname}${source.search}`, PRIMARY_ORIGIN);
  return Response.redirect(destination.toString(), 301);
}
