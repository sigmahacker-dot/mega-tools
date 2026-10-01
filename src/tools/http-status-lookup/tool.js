(function () {
  'use strict';
  var ERR = 'http-status-lookup-error';
  var DATA = [
    [100, 'Continue', 'Server received the request headers; client should send the body.'],
    [101, 'Switching Protocols', 'Server is switching protocols as requested (e.g. to WebSocket).'],
    [102, 'Processing', 'Server is processing (WebDAV); no response yet.'],
    [103, 'Early Hints', 'Preliminary headers to start preloading while the final response is prepared.'],
    [200, 'OK', 'The standard success response for GET, PUT, PATCH, DELETE.'],
    [201, 'Created', 'Request succeeded and a new resource was created (POST/PUT).'],
    [202, 'Accepted', 'Request accepted for processing, but not completed yet.'],
    [203, 'Non-Authoritative Information', 'Response is a transformed version from a third party.'],
    [204, 'No Content', 'Success with intentionally no response body.'],
    [205, 'Reset Content', 'Success; client should reset the document view.'],
    [206, 'Partial Content', 'Success for a Range request; body contains the requested byte range.'],
    [207, 'Multi-Status', 'WebDAV: multiple status codes for batched operations.'],
    [208, 'Already Reported', 'WebDAV: members already listed in a previous response.'],
    [226, 'IM Used', 'Server fulfilled GET with instance manipulations applied.'],
    [300, 'Multiple Choices', 'Several representations available; client should choose.'],
    [301, 'Moved Permanently', 'Resource moved to a new URL; update bookmarks and links.'],
    [302, 'Found', 'Temporary redirect; historically changed POST to GET.'],
    [303, 'See Other', 'Redirect to another URL using GET (e.g. after form POST).'],
    [304, 'Not Modified', 'Cached copy is still fresh; no body is sent.'],
    [305, 'Use Proxy', 'Deprecated: must be accessed through the given proxy.'],
    [307, 'Temporary Redirect', 'Like 302 but the request method must not change.'],
    [308, 'Permanent Redirect', 'Like 301 but the request method must not change.'],
    [400, 'Bad Request', 'Server cannot process the malformed request.'],
    [401, 'Unauthorized', 'Authentication required or credentials invalid.'],
    [402, 'Payment Required', 'Reserved; used by some APIs for billing-gated access.'],
    [403, 'Forbidden', 'Authenticated but not allowed to access this resource.'],
    [404, 'Not Found', 'No resource exists at this URL.'],
    [405, 'Method Not Allowed', 'The HTTP method is not supported for this resource.'],
    [406, 'Not Acceptable', 'Server cannot produce a response matching the Accept headers.'],
    [407, 'Proxy Authentication Required', 'Authenticate with the proxy first.'],
    [408, 'Request Timeout', 'Server timed out waiting for the request.'],
    [409, 'Conflict', 'Request conflicts with current server state (e.g. version mismatch).'],
    [410, 'Gone', 'Resource was permanently deleted.'],
    [411, 'Length Required', 'Content-Length header is required.'],
    [412, 'Precondition Failed', 'An If-* precondition header evaluated to false.'],
    [413, 'Content Too Large', 'Request body exceeds the server limit.'],
    [414, 'URI Too Long', 'The request URL is too long.'],
    [415, 'Unsupported Media Type', 'Request body media type is not supported.'],
    [416, 'Range Not Satisfiable', 'Requested byte range cannot be served.'],
    [417, 'Expectation Failed', 'Server cannot meet the Expect header requirements.'],
    [418, "I'm a teapot", 'April Fools RFC 2324 joke code; also used as an Easter egg.'],
    [419, 'Page Expired (unofficial)', 'Used by Laravel when the CSRF token is missing/expired.'],
    [421, 'Misdirected Request', 'Request sent to a server that cannot produce a response.'],
    [422, 'Unprocessable Content', 'Well-formed request but semantically invalid (validation errors).'],
    [423, 'Locked', 'WebDAV: the resource is locked.'],
    [424, 'Failed Dependency', 'WebDAV: failed because a previous request failed.'],
    [425, 'Too Early', 'Server refuses to process a request that might be replayed.'],
    [426, 'Upgrade Required', 'Client must switch protocols (e.g. to TLS).'],
    [428, 'Precondition Required', 'Origin server requires conditional requests.'],
    [429, 'Too Many Requests', 'Rate limit exceeded; back off and retry later.'],
    [431, 'Request Header Fields Too Large', 'Headers (often cookies) exceed the limit.'],
    [440, 'Login Timeout (unofficial)', 'IIS: session expired; log in again.'],
    [449, 'Retry With (unofficial)', 'IIS: retry after performing the required action.'],
    [451, 'Unavailable For Legal Reasons', 'Blocked due to legal demands (censorship, GDPR takedown).'],
    [500, 'Internal Server Error', 'Generic server-side failure.'],
    [501, 'Not Implemented', 'Server does not support the requested functionality.'],
    [502, 'Bad Gateway', 'Upstream server returned an invalid response.'],
    [503, 'Service Unavailable', 'Server overloaded or down for maintenance.'],
    [504, 'Gateway Timeout', 'Upstream server did not respond in time.'],
    [505, 'HTTP Version Not Supported', 'Server does not support the HTTP version used.'],
    [506, 'Variant Also Negotiates', 'Content negotiation led to a circular reference.'],
    [507, 'Insufficient Storage', 'WebDAV: server cannot store the representation.'],
    [508, 'Loop Detected', 'WebDAV: infinite loop detected while processing.'],
    [510, 'Not Extended', 'Further extensions to the request are required.'],
    [511, 'Network Authentication Required', 'Authenticate to gain network access (captive portal).']
  ];
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var CLASS_COLOR = { 1: '#7dd3fc', 2: '#4ade80', 3: '#fcd34d', 4: '#fb923c', 5: '#f87171' };
  function render() {
    TN.clearErr(ERR);
    var q = TN.el('http-q').value.trim().toLowerCase();
    var cls = TN.el('http-class').value;
    var rows = DATA.filter(function (d) {
      if (cls && String(d[0]).charAt(0) !== cls) return false;
      if (!q) return true;
      return String(d[0]).indexOf(q) !== -1 || d[1].toLowerCase().indexOf(q) !== -1 || d[2].toLowerCase().indexOf(q) !== -1;
    });
    TN.el('http-count').textContent = rows.length;
    TN.el('http-body').innerHTML = rows.map(function (d) {
      var c = CLASS_COLOR[String(d[0]).charAt(0)] || '#fff';
      return '<tr><td><strong style="color:' + c + '">' + d[0] + '</strong></td><td>' + esc(d[1]) + '</td><td>' + esc(d[2]) + '</td></tr>';
    }).join('') || '<tr><td colspan="3" class="muted">No matching status codes.</td></tr>';
  }
  try {
    TN.on('http-q', 'input', render);
    TN.on('http-class', 'change', render);
    render();
  } catch (e) { /* never throw on load */ }
})();