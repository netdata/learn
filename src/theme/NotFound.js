export default function NotFound() {
  var url = location.href
  // var query = url.split('https://learn.netdata.cloud/')[1]
  var query = url.split('/')[3]
  var target = query.replaceAll("\/", " ").replace(".", " ")
  var base = url.split(query)[0]
  window.location.replace(base + 'search?q=' + target);

  return null
}