export default function NotFound() {
  useEffect(() => {
    window.posthog.capture('page-not-found');
    var url = location.href
    var query = url.split('/')[3]
    var target = query.replaceAll("\/", " ").replace(".", " ")
    var base = url.split(query)[0]
    window.location.replace(base + 'search?q=' + target);
  }, [])
  return null
}